import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { PublicKey } from '@solana/web3.js';
import {
  BlinkActionMetadata,
  BlinkActionTransaction,
  BlinkLinkedAction,
} from '@/types/blink';

/**
 * Server-side helpers for Solana Actions ("blinks").
 * All outbound requests are validated to block SSRF against private
 * or link-local addresses, and redirects are followed hop-by-hop with
 * the same validation.
 */

const SOLANA_MAINNET_CHAIN_ID = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
const ACTION_VERSION = '2.4.1';
const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;

const ACTION_HEADERS = {
  Accept: 'application/json',
  'X-Action-Version': ACTION_VERSION,
  'X-Blockchain-Ids': SOLANA_MAINNET_CHAIN_ID,
};

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'broadcasthost',
]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
  if (a === 192 && b === 168) return true;
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
    return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224) return true;
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (/^fe[89ab]/.test(lower)) return true;
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mapped) return isPrivateIPv4(mapped);
  return false;
}

function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPrivateIPv4(address);
  if (version === 6) return isPrivateIPv6(address);
  return false;
}

/**
 * Validates that a blink URL points at a public HTTPS host. Resolves the
 * hostname and rejects any address that is private, link-local, or reserved.
 */
export async function assertPublicBlinkUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Invalid blink URL');
  }

  if (url.protocol !== 'https:') {
    throw new Error('Blink URLs must use https');
  }

  const hostname = url.hostname.toLowerCase();
  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Blink URL host is not allowed');
  }

  const literalVersion = isIP(hostname.replace(/^\[|\]$/g, ''));
  if (literalVersion !== 0) {
    if (isPrivateAddress(hostname.replace(/^\[|\]$/g, ''))) {
      throw new Error('Blink URL host is not allowed');
    }
    return url;
  }

  try {
    const addresses = await lookup(hostname, { all: true });
    if (
      addresses.length === 0 ||
      addresses.some((a) => isPrivateAddress(a.address))
    ) {
      throw new Error('Blink URL host is not allowed');
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Blink URL host is not allowed'
    ) {
      throw error;
    }
    throw new Error('Blink URL host could not be resolved');
  }

  return url;
}

async function fetchBlinkJson(
  url: URL,
  init: RequestInit = {}
): Promise<unknown> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(current, {
      ...init,
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { ...ACTION_HEADERS, ...(init.headers ?? {}) },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error('Blink endpoint redirected without a location');
      }
      current = await assertPublicBlinkUrl(
        new URL(location, current).toString()
      );
      continue;
    }

    if (!response.ok) {
      throw new Error(`Blink endpoint responded with ${response.status}`);
    }

    return response.json();
  }
  throw new Error('Blink endpoint redirected too many times');
}

/** Fetches and validates the metadata for a Solana Action URL. */
export async function getBlinkMetadata(
  rawUrl: string
): Promise<BlinkActionMetadata> {
  const url = await assertPublicBlinkUrl(rawUrl);
  const body = (await fetchBlinkJson(url)) as Partial<BlinkActionMetadata>;
  if (!body || typeof body.title !== 'string') {
    throw new Error('Blink endpoint returned invalid metadata');
  }
  return body as BlinkActionMetadata;
}

/** Resolves a possibly-relative action href against the blink URL. */
export function resolveActionHref(actionUrl: string, href: string): string {
  return new URL(href, actionUrl).toString();
}

/**
 * Builds the final action URL: `{name}` placeholders in the href are
 * substituted first, then any remaining params are appended as query params.
 */
export function buildActionUrl(
  actionUrl: string,
  action: BlinkLinkedAction,
  params: Record<string, string> = {}
): string {
  return applyActionParams(resolveActionHref(actionUrl, action.href), params);
}

/**
 * Substitutes `{name}` placeholders in a URL first, then appends any
 * remaining params as query parameters.
 */
export function applyActionParams(
  rawUrl: string,
  params: Record<string, string> = {}
): string {
  let href = rawUrl;
  const remaining: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (href.includes(`{${key}}`)) {
      href = href.replaceAll(`{${key}}`, encodeURIComponent(value));
    } else {
      remaining[key] = value;
    }
  }
  const url = new URL(href);
  for (const [key, value] of Object.entries(remaining)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/**
 * POSTs to a Solana Action endpoint to build the transaction for the given
 * account. Returns the base64 transaction and optional display message.
 */
export async function postBlinkAction(
  rawUrl: string,
  account: string,
  params: Record<string, string> = {}
): Promise<BlinkActionTransaction> {
  try {
    new PublicKey(account);
  } catch {
    throw new Error('Invalid account public key');
  }

  const url = await assertPublicBlinkUrl(applyActionParams(rawUrl, params));
  const body = (await fetchBlinkJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account }),
  })) as Partial<BlinkActionTransaction>;

  if (!body || typeof body.transaction !== 'string' || !body.transaction) {
    throw new Error('Blink endpoint returned no transaction');
  }
  return { transaction: body.transaction, message: body.message };
}
