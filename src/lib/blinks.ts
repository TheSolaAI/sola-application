/**
 * Shared helpers for loading and initiating Blink (Solana Action) requests
 * directly, instead of going through a default third-party Blink widget.
 *
 * The host allow/deny checks here are a best-effort literal hostname/IP
 * guard against pointing the server-side fetch at obviously internal
 * targets (localhost, RFC1918 ranges). They are not a substitute for
 * network-level egress controls or DNS-rebinding protection.
 */

const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1']);

function isPrivateIPv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;

  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return false;
  const [a, b] = octets;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Validates that a Blink action URL is well-formed, uses https, and does
 * not point at an obviously internal/private host. Throws on failure.
 */
export function assertSafeActionUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid Blink action URL');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Blink action URLs must use https');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local')) {
    throw new Error('Blink action URL points to a disallowed host');
  }

  if (isPrivateIPv4(hostname)) {
    throw new Error('Blink action URL points to a private network address');
  }

  return parsed;
}

/** Resolves an action href (which may be relative) against the Blink's base URL. */
export function resolveActionHref(baseUrl: string, href: string): string {
  return new URL(href, baseUrl).toString();
}

/**
 * Substitutes `{paramName}` placeholders in an action href with the
 * provided parameter values, per the Solana Actions spec's optional
 * href templating for parameterized actions.
 */
export function applyActionParameters(
  href: string,
  parameters?: Record<string, string>
): string {
  if (!parameters) return href;
  return href.replace(/\{([^}]+)\}/g, (match, key: string) => {
    const value = parameters[key];
    return value !== undefined ? encodeURIComponent(value) : match;
  });
}
