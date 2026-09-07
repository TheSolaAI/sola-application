import { lookup } from 'node:dns/promises';
import { assertSafeActionUrl, UnsafeBlinkUrlError } from '@/lib/blinks/ssrf';
import { findKnownBlinkGame } from '@/config/blinks';
import {
  applyActionsJsonRules,
  parseBlinkUrl,
  type ActionJsonRule,
} from '@/lib/blinks/url';
import { applyActionParams } from '@/lib/blinks/params';
import { isBlinkMetadata, normalizeActionType } from '@/lib/blinks/spec';
import { isSolanaAddress } from '@/lib/blinks/encoding';
import type {
  BlinkExecutePayload,
  BlinkMetadata,
  LinkedActionType,
} from '@/types/blink';

const ACTION_HEADERS = {
  Accept: 'application/json',
  'X-Action-Version': '2.2',
  'X-Blockchain-Ids':
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp,solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1,solana:mainnet,solana:devnet',
};

const FETCH_TIMEOUT_MS = 8_000;
const MAX_BODY_BYTES = 512 * 1024;

type BlinkIntent = 'metadata' | 'execute' | 'next';

type BlinkActionRequest = {
  intent?: BlinkIntent;
  actionUrl?: string;
  account?: string;
  actionHref?: string;
  params?: Record<string, string>;
  actionType?: LinkedActionType;
  signature?: string;
  state?: string;
  signedData?: unknown;
};

const lookupAll = async (hostname: string) =>
  lookup(hostname, { all: true, verbatim: true });

const safeUrl = (value: string) => assertSafeActionUrl(value, lookupAll);

const readLimitedText = async (response: Response) => {
  const length = Number(response.headers.get('content-length') ?? '0');
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    throw new Error('Blink response was too large');
  }

  if (!response.body) {
    return '';
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('Blink response was too large');
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
};

const readJson = async (response: Response) => {
  const text = await readLimitedText(response);
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const fetchBlink = async (url: string, init?: RequestInit) => {
  await safeUrl(url);

  return fetch(url, {
    ...init,
    headers: {
      ...ACTION_HEADERS,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
};

const jsonError = (error: string, status: number, extra?: object) =>
  Response.json({ error, ...extra }, { status });

const asRules = (value: unknown): ActionJsonRule[] => {
  if (!value || typeof value !== 'object') return [];
  const rules = (value as { rules?: ActionJsonRule[] }).rules;
  return Array.isArray(rules) ? rules : [];
};

const loadMetadata = async (actionUrl: string): Promise<BlinkMetadata> => {
  let metadataResponse: Response;
  try {
    metadataResponse = await fetchBlink(actionUrl);
  } catch (error) {
    if (error instanceof UnsafeBlinkUrlError) {
      throw error;
    }
    throw new Error('Unable to load Blink metadata');
  }

  if (metadataResponse.ok) {
    const metadata = await readJson(metadataResponse);
    if (isBlinkMetadata(metadata)) {
      return metadata;
    }
  }

  const origin = new URL(actionUrl).origin;
  const actionsJsonUrl = `${origin}/actions.json`;
  let actionsJsonResponse: Response;
  try {
    actionsJsonResponse = await fetchBlink(actionsJsonUrl);
  } catch {
    throw new Error('Unable to load Blink metadata');
  }

  if (!actionsJsonResponse.ok) {
    throw new Error('Unable to load Blink metadata');
  }

  const actionsJson = await readJson(actionsJsonResponse);
  const mapped = applyActionsJsonRules(actionUrl, asRules(actionsJson));
  if (!mapped || mapped === actionUrl) {
    throw new Error('Blink metadata response was not valid JSON');
  }

  const mappedResponse = await fetchBlink(mapped);
  const mappedMetadata = mappedResponse.ok
    ? await readJson(mappedResponse)
    : null;
  if (!isBlinkMetadata(mappedMetadata)) {
    throw new Error('Blink metadata response was not valid JSON');
  }

  return mappedMetadata;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BlinkActionRequest;
    const intent: BlinkIntent = body.intent ?? 'metadata';

    if (!body.actionUrl) {
      return jsonError('A valid Blink actionUrl is required', 400);
    }

    let parsed;
    try {
      parsed = parseBlinkUrl(body.actionUrl, findKnownBlinkGame);
    } catch {
      return jsonError('A valid Blink actionUrl is required', 400);
    }

    try {
      await safeUrl(parsed.actionUrl);
    } catch {
      return jsonError('A valid Blink actionUrl is required', 400);
    }

    if (intent === 'metadata') {
      try {
        const metadata = await loadMetadata(parsed.actionUrl);
        return Response.json({ metadata });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load Blink metadata';
        const status = error instanceof UnsafeBlinkUrlError ? 400 : 502;
        return jsonError(message, status);
      }
    }

    if (!body.account || !isSolanaAddress(body.account)) {
      return jsonError('A valid Solana account is required', 400);
    }

    if (intent === 'next') {
      if (!body.actionHref) {
        return jsonError('A Blink next-action URL is required', 400);
      }

      const nextUrl = new URL(body.actionHref, parsed.actionUrl).toString();
      await safeUrl(nextUrl);

      const nextResponse = await fetchBlink(nextUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: body.account,
          signature: body.signature,
          state: body.state,
          data: body.signedData,
        }),
      });

      const nextPayload = (await readJson(nextResponse)) ?? {};
      if (!nextResponse.ok) {
        return jsonError(
          String(
            nextPayload.message ||
              nextPayload.error ||
              'Unable to load the next Blink action'
          ),
          nextResponse.status >= 400 ? nextResponse.status : 502
        );
      }

      if (!isBlinkMetadata(nextPayload)) {
        return jsonError('Next Blink action was not valid JSON', 502);
      }

      return Response.json({ metadata: nextPayload });
    }

    let applied;
    try {
      applied = applyActionParams(
        parsed.actionUrl,
        body.actionHref || parsed.actionUrl,
        body.params
      );
    } catch (error) {
      return jsonError(
        error instanceof Error ? error.message : 'Invalid Blink parameters',
        400
      );
    }

    await safeUrl(applied.href);

    const postBody: Record<string, unknown> = {
      account: body.account,
    };
    if (body.actionType) {
      postBody.type = body.actionType;
    }
    if (Object.keys(applied.data).length) {
      postBody.data = applied.data;
    }

    let transactionResponse: Response;
    try {
      transactionResponse = await fetchBlink(applied.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to create Blink transaction';
      return jsonError(message, 400);
    }

    const transactionPayload = (await readJson(transactionResponse)) ?? {};
    if (!transactionResponse.ok) {
      return jsonError(
        String(
          transactionPayload.message ||
            transactionPayload.error ||
            'Unable to create Blink transaction'
        ),
        transactionResponse.status >= 400 ? transactionResponse.status : 502
      );
    }

    const payload = transactionPayload as BlinkExecutePayload;
    const type = normalizeActionType(payload.type, payload);

    if (type === 'transaction' && !payload.transaction) {
      return jsonError('Blink did not return a transaction', 502);
    }

    if (type === 'external-link' && !payload.externalLink) {
      return jsonError('Blink did not return an external link', 502);
    }

    if (type === 'message' && payload.data == null) {
      return jsonError('Blink did not return a message to sign', 502);
    }

    return Response.json({
      payload: {
        ...payload,
        type,
      },
    });
  } catch (error) {
    if (error instanceof UnsafeBlinkUrlError) {
      return jsonError('A valid Blink actionUrl is required', 400);
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
}
