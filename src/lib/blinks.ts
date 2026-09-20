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
const MAX_RESPONSE_BYTES = 256 * 1024;

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

/**
 * Expands an IPv6 address (including `::` compression and a trailing
 * dotted-quad) into its eight 16-bit hextets. Returns null when the
 * address cannot be parsed.
 */
function ipv6ToHextets(ip: string): number[] | null {
  const noZone = ip.split('%', 1)[0];
  const dbl = noZone.indexOf('::');
  const head = dbl >= 0 ? noZone.slice(0, dbl) : noZone;
  const tail = dbl >= 0 ? noZone.slice(dbl + 2) : '';

  const parseParts = (part: string): number[] | null => {
    if (!part) return [];
    const hextets: number[] = [];
    for (const token of part.split(':')) {
      if (token.includes('.')) {
        const v4 = token.split('.').map(Number);
        if (
          v4.length !== 4 ||
          v4.some((n) => Number.isNaN(n) || n < 0 || n > 255)
        ) {
          return null;
        }
        hextets.push((v4[0] << 8) | v4[1], (v4[2] << 8) | v4[3]);
      } else {
        if (!/^[0-9a-fA-F]{1,4}$/.test(token)) return null;
        hextets.push(parseInt(token, 16));
      }
    }
    return hextets;
  };

  const headParts = parseParts(head);
  const tailParts = dbl >= 0 ? parseParts(tail) : [];
  if (!headParts || !tailParts) return null;
  if (dbl >= 0) {
    const missing = 8 - headParts.length - tailParts.length;
    if (missing < 1) return null;
    return [...headParts, ...new Array<number>(missing).fill(0), ...tailParts];
  }
  return headParts.length === 8 ? headParts : null;
}

/**
 * Checks an IPv6 address for loopback, private, link-local and reserved
 * space. IPv4-embedding schemes (mapped ::ffff:, compatible ::, NAT64
 * 64:ff9b::, 6to4 2002::, Teredo 2001::) are unpacked so the inner IPv4
 * address is checked against the same private ranges — this blocks
 * localhost regardless of the representation used.
 */
function isPrivateIPv6(ip: string): boolean {
  const hextets = ipv6ToHextets(ip);
  if (!hextets) return true;
  const [h0, h1, h2, h3, h4, h5, h6, h7] = hextets;
  const embeddedV4 = (hi: number, lo: number) =>
    `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;

  if (h0 === 0) {
    if (h1 === 0 && h2 === 0 && h3 === 0 && h4 === 0) {
      // ::ffff:0:0/96 IPv4-mapped and ::/96 IPv4-compatible (covers :: and ::1)
      if (h5 === 0xffff || h5 === 0) return isPrivateIPv4(embeddedV4(h6, h7));
    }
    return true; // the remainder of ::/8 is reserved
  }
  if (h0 === 0x0064 && h1 === 0xff9b && h2 === 0 && h3 === 0 && h4 === 0) {
    return isPrivateIPv4(embeddedV4(h6, h7)); // NAT64 64:ff9b::/96
  }
  if (h0 === 0x0064 && h1 === 0xff9b && h2 === 1) {
    return isPrivateIPv4(embeddedV4(h4, h5)); // NAT64 64:ff9b:1::/48
  }
  if (h0 === 0x2002) {
    return isPrivateIPv4(embeddedV4(h1, h2)); // 6to4 2002::/16
  }
  if (h0 === 0x2001 && h1 === 0) {
    return isPrivateIPv4(embeddedV4(~h6 & 0xffff, ~h7 & 0xffff)); // Teredo
  }
  if ((h0 & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((h0 & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((h0 & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local
  if ((h0 & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (h0 === 0x0100) return true; // 100::/64 discard-only
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

    return readBoundedJson(response);
  }
  throw new Error('Blink endpoint redirected too many times');
}

/**
 * Parses a response body as JSON while capping the accepted size, so a
 * hostile blink endpoint cannot exhaust memory with an unbounded body.
 */
async function readBoundedJson(response: Response): Promise<unknown> {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    throw new Error('Blink endpoint response too large');
  }
  if (!response.body) {
    return response.json();
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error('Blink endpoint response too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
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
