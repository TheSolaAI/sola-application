import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

export interface BlinkParameter {
  name: string;
  label?: string;
  required?: boolean;
}

export interface BlinkLinkedAction {
  label: string;
  href: string;
  parameters?: BlinkParameter[];
}

export interface BlinkMetadata {
  title: string;
  icon: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions: BlinkLinkedAction[];
  };
  error?: {
    message: string;
  };
}

export interface BlinkActionPayload {
  transaction: string; // base64 encoded serialized transaction
  message?: string;
  redirect?: string;
}

export interface BlinkExecutionResult {
  metadata: BlinkMetadata;
  actionUrl: string;
  resolvedHref?: string;
  transactionPayload?: BlinkActionPayload;
  autoExecute: boolean;
  status: 'ready' | 'pending' | 'success' | 'error';
  error?: string;
}

export const ACTION_HEADERS: Record<string, string> = {
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

export const isPrivateHost = (hostname: string): boolean =>
  PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));

export const normalizeBlinkUrl = (rawUrl: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('A valid action URL is required');
  }

  let cleaned = rawUrl.trim();
  if (cleaned.startsWith('solana-action:')) {
    cleaned = cleaned.replace(/^solana-action:/i, '');
  } else if (cleaned.startsWith('blink:')) {
    cleaned = cleaned.replace(/^blink:/i, '');
  }

  return cleaned;
};

export const parseHttpUrl = (value: string): { url: URL; hostname: string } => {
  const normalized = normalizeBlinkUrl(value);
  const url = new URL(normalized);
  const hostname = url.hostname.replace(/^\[|\]$/g, '');

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Blink action URL must use http or https');
  }

  if (isPrivateHost(hostname)) {
    throw new Error('Unsafe Blink action URL: Private host rejected');
  }

  return { url, hostname };
};

export const assertSafeActionUrl = async (value: string): Promise<void> => {
  const { hostname } = parseHttpUrl(value);

  if (isIP(hostname)) {
    if (isPrivateHost(hostname)) {
      throw new Error('Unsafe Blink action URL: Private IP rejected');
    }
    return;
  }

  try {
    const addresses = await lookup(hostname, { all: true });
    if (addresses.some(({ address }) => isPrivateHost(address))) {
      throw new Error('Unsafe Blink action URL: Resolved to private network');
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Unsafe Blink action URL')) {
      throw err;
    }
    // DNS resolution failure is handled downstream by fetch
  }
};

export const resolveActionHref = async (
  actionUrl: string,
  actionHref?: string,
  params?: Record<string, string>
): Promise<string> => {
  const normalizedBase = normalizeBlinkUrl(actionUrl);
  const href = actionHref || normalizedBase;
  const url = new URL(href, normalizedBase);

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

export const fetchBlinkMetadata = async (
  rawUrl: string,
  timeoutMs: number = 8000
): Promise<BlinkMetadata> => {
  const normalized = normalizeBlinkUrl(rawUrl);
  await assertSafeActionUrl(normalized);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(normalized, {
      method: 'GET',
      headers: ACTION_HEADERS,
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to load Blink metadata: HTTP ${response.status}`);
    }

    const data = (await response.json()) as BlinkMetadata;
    if (!data.title || !data.icon) {
      throw new Error('Invalid Blink metadata: title and icon are required');
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
};

export const requestBlinkTransaction = async (
  actionUrl: string,
  account: string,
  actionHref?: string,
  params?: Record<string, string>,
  timeoutMs: number = 10000
): Promise<{ metadata: BlinkMetadata; transactionPayload: BlinkActionPayload; resolvedHref: string }> => {
  if (!account) {
    throw new Error('A connected Solana account public key is required');
  }

  const metadata = await fetchBlinkMetadata(actionUrl, timeoutMs);
  const resolvedHref = await resolveActionHref(actionUrl, actionHref, params);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(resolvedHref, {
      method: 'POST',
      headers: ACTION_HEADERS,
      body: JSON.stringify({ account }),
      cache: 'no-store',
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.transaction) {
      const errorMsg =
        payload.message || payload.error || `Action failed with HTTP ${response.status}`;
      throw new Error(errorMsg);
    }

    return {
      metadata,
      transactionPayload: payload as BlinkActionPayload,
      resolvedHref,
    };
  } finally {
    clearTimeout(timer);
  }
};
