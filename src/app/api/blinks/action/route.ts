import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

type BlinkActionRequest = {
  actionUrl?: string;
  account?: string;
  actionHref?: string;
  params?: Record<string, string>;
};

const ACTION_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-Action-Version': '2.2.1',
  'X-Blockchain-Ids': 'solana:mainnet,solana:devnet',
};

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc00:/i,
  /^fd00:/i,
  /^fe80:/i,
];

const isPrivateHost = (hostname: string) =>
  PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));

const parseHttpUrl = (value: string) => {
  const url = new URL(value);
  const hostname = url.hostname.replace(/^\[|\]$/g, '');

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Blink action URL must use http or https');
  }

  if (isPrivateHost(hostname)) {
    throw new Error('Unsafe Blink action URL');
  }

  return { url, hostname };
};

const assertSafeActionUrl = async (value: string) => {
  const { hostname } = parseHttpUrl(value);

  if (isIP(hostname)) {
    return;
  }

  const addresses = await lookup(hostname, { all: true });
  if (addresses.some(({ address }) => isPrivateHost(address))) {
    throw new Error('Unsafe Blink action URL');
  }
};

const resolveActionHref = async (
  actionUrl: string,
  actionHref?: string,
  params?: Record<string, string>
) => {
  const href = actionHref || actionUrl;
  const url = new URL(href, actionUrl);

  await assertSafeActionUrl(url.toString());

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  return url.toString();
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BlinkActionRequest;

    if (!body.actionUrl) {
      return Response.json(
        { error: 'A valid Blink actionUrl is required' },
        { status: 400 }
      );
    }

    try {
      await assertSafeActionUrl(body.actionUrl);
    } catch {
      return Response.json(
        { error: 'A valid Blink actionUrl is required' },
        { status: 400 }
      );
    }

    const metadataResponse = await fetch(body.actionUrl, {
      headers: ACTION_HEADERS,
      cache: 'no-store',
    });

    if (!metadataResponse.ok) {
      return Response.json(
        { error: 'Unable to load Blink metadata' },
        { status: metadataResponse.status }
      );
    }

    const metadata = await metadataResponse.json();

    if (!body.account) {
      return Response.json({ metadata });
    }

    const actionHref = await resolveActionHref(
      body.actionUrl,
      body.actionHref,
      body.params
    );

    const transactionResponse = await fetch(actionHref, {
      method: 'POST',
      headers: ACTION_HEADERS,
      body: JSON.stringify({ account: body.account }),
      cache: 'no-store',
    });

    const transactionPayload = await transactionResponse
      .json()
      .catch(() => ({}));

    if (!transactionResponse.ok) {
      return Response.json(
        {
          metadata,
          error:
            transactionPayload.message ||
            transactionPayload.error ||
            'Unable to create Blink transaction',
        },
        { status: transactionResponse.status }
      );
    }

    return Response.json({ metadata, transactionPayload });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
