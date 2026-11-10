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
  let cleaned = value.trim();
  if (cleaned.startsWith('solana-action:')) {
    cleaned = cleaned.replace(/^solana-action:/i, '');
  } else if (cleaned.startsWith('blink:')) {
    cleaned = cleaned.replace(/^blink:/i, '');
  }

  const url = new URL(cleaned);
  const hostname = url.hostname.replace(/^\\[|\\]$/g, '');

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
    if (isPrivateHost(hostname)) {
      throw new Error('Unsafe Blink action URL');
    }
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

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      const rawToken = `{${key}}`;
      const encodedToken = `%7B${key}%7D`;
      const hasPath = url.pathname.includes(rawToken) || url.pathname.includes(encodedToken);
      const hasSearch = url.search.includes(rawToken) || url.search.includes(encodedToken);

      if (hasPath) {
        url.pathname = url.pathname
          .replaceAll(rawToken, encodeURIComponent(value))
          .replaceAll(encodedToken, encodeURIComponent(value));
      } else if (hasSearch) {
        url.search = url.search
          .replaceAll(rawToken, encodeURIComponent(value))
          .replaceAll(encodedToken, encodeURIComponent(value));
      } else {
        url.searchParams.set(key, value);
      }
    }
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
        { error: 'A valid public Blink actionUrl is required (private networks disallowed)' },
        { status: 400 }
      );
    }

    // Step 1: Fetch Blink metadata
    const metadataResponse = await fetch(body.actionUrl, {
      headers: ACTION_HEADERS,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (!metadataResponse.ok) {
      return Response.json(
        { error: `Unable to load Blink metadata: HTTP ${metadataResponse.status}` },
        { status: metadataResponse.status }
      );
    }

    const metadata = await metadataResponse.json();

    // If no account is provided, return metadata only
    if (!body.account) {
      return Response.json({ metadata });
    }

    // Step 2: Request Action transaction for connected account
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
      signal: AbortSignal.timeout(10000),
    });

    const transactionPayload = await transactionResponse
      .json()
      .catch(() => ({}));

    if (!transactionResponse.ok || !transactionPayload.transaction) {
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
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
