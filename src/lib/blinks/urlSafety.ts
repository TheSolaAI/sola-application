/**
 * URL safety helpers for Solana Actions / Blinks proxying.
 * Blocks localhost and private network targets to reduce SSRF risk.
 */

const PRIVATE_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^\[::1\]$/,
  /^::1$/,
];

export function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  return PRIVATE_HOST_PATTERNS.some((re) => re.test(host));
}

export function assertPublicHttpUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Invalid blink action URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Blink action URL must be http(s)');
  }
  if (isPrivateOrLocalHost(url.hostname)) {
    throw new Error('Blink action URL targets a private/local host');
  }
  return url;
}

export function resolveBlinkActionUrl(input: string): string {
  const trimmed = input.trim();
  const url = assertPublicHttpUrl(trimmed);
  if (url.hostname.endsWith('dial.to')) {
    const action = url.searchParams.get('action');
    if (action) {
      const decoded = decodeURIComponent(action);
      const prefix = 'solana-action:';
      if (decoded.startsWith(prefix)) {
        return assertPublicHttpUrl(decoded.slice(prefix.length)).toString();
      }
    }
  }
  return url.toString();
}

export type BlinkActionLink = {
  label: string;
  href: string;
  parameters?: Array<{ name: string; label?: string; required?: boolean }>;
};

export type BlinkActionMetadata = {
  icon?: string;
  title?: string;
  description?: string;
  label?: string;
  links?: { actions?: BlinkActionLink[] };
  error?: { message?: string };
};

export function pickDefaultAction(metadata: BlinkActionMetadata): BlinkActionLink | null {
  const actions = metadata.links?.actions;
  if (actions && actions.length > 0) return actions[0];
  if (metadata.label) return { label: metadata.label, href: '' };
  return null;
}
