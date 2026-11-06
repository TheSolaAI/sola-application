export interface BlinkActionParameterOption {
  label: string;
  value: string;
  selected?: boolean;
}

export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
  pattern?: string;
  patternDescription?: string;
  min?: string | number;
  max?: string | number;
  options?: BlinkActionParameterOption[];
}

export interface BlinkActionLink {
  label: string;
  href: string;
  parameters?: BlinkActionParameter[];
}

export interface BlinkActionMetadata {
  icon?: string;
  title: string;
  description?: string;
  label?: string;
  disabled?: boolean;
  links?: {
    actions?: BlinkActionLink[];
  };
  error?: {
    message: string;
  };
}

export interface BlinkActionMessageData {
  actionUrl: string;
  actionLabel?: string;
  parameters?: Record<string, string>;
  autoExecute?: boolean;
  walletAddress?: string;
  metadata?: BlinkActionMetadata;
}

export interface BlinkActionPostResponse {
  transaction: string;
  message?: string;
}

export const SOLANA_ACTION_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'X-Action-Version': '2.1.3',
  'X-Blockchain-Ids': 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
};

const BASE64_TX_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
  /^\[?fc00:/i,
  /^\[?fe80:/i,
  /\.local$/i,
  /\.internal$/i,
];

/**
 * Unwraps a `solana-action:` or `https://dial.to/?action=solana-action:...` URL
 * into the underlying HTTPS Action endpoint URL.
 */
export function normalizeBlinkActionUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error('Blink action URL cannot be empty.');
  }

  if (trimmed.startsWith('solana-action:')) {
    return decodeURIComponent(trimmed.slice('solana-action:'.length));
  }

  const parsed = new URL(trimmed);
  const actionParam = parsed.searchParams.get('action');
  if (actionParam) {
    const decoded = decodeURIComponent(actionParam);
    if (decoded.startsWith('solana-action:')) {
      return decoded.slice('solana-action:'.length);
    }
    if (decoded.startsWith('https://')) {
      return decoded;
    }
  }

  return parsed.toString();
}

/**
 * Validates that a Blink URL uses HTTPS and does not target localhost or private networks.
 */
export function assertSafeBlinkUrl(rawUrl: string): URL {
  const normalized = normalizeBlinkActionUrl(rawUrl);
  const parsed = new URL(normalized);

  if (parsed.protocol !== 'https:') {
    throw new Error('Blink action URLs must use HTTPS.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new Error(`Unsafe Blink action host blocked: ${hostname}`);
  }

  return parsed;
}

/**
 * Resolves `{param}` placeholders in a Blink action `href` and validates the resolved URL.
 */
export function resolveBlinkActionHref(
  href: string,
  baseActionUrl: string,
  parameters: Record<string, string> = {}
): URL {
  const baseUrl = assertSafeBlinkUrl(baseActionUrl);
  let resolvedHref = href.trim() || baseUrl.toString();

  const placeholders = resolvedHref.match(/\{([^}]+)\}/g) ?? [];
  for (const token of placeholders) {
    const paramName = token.slice(1, -1).trim();
    const paramValue = parameters[paramName]?.trim();
    if (!paramValue) {
      throw new Error(`Missing required Blink parameter: ${paramName}`);
    }
    resolvedHref = resolvedHref.replaceAll(
      token,
      encodeURIComponent(paramValue)
    );
  }

  const targetUrl = new URL(resolvedHref, baseUrl);
  if (targetUrl.origin !== baseUrl.origin) {
    throw new Error(
      `Cross-origin Blink action href blocked: ${targetUrl.origin}`
    );
  }

  return assertSafeBlinkUrl(targetUrl.toString());
}

/**
 * Normalizes a Blink metadata document so single-button Actions and multi-action Blinks
 * share a consistent list of executable `BlinkActionLink` items.
 */
export function getExecutableBlinkActions(
  metadata: BlinkActionMetadata,
  actionUrl: string
): BlinkActionLink[] {
  const linkedActions = metadata.links?.actions;
  if (Array.isArray(linkedActions) && linkedActions.length > 0) {
    return linkedActions;
  }

  return [
    {
      label: metadata.label || metadata.title || 'Execute Action',
      href: actionUrl,
      parameters: [],
    },
  ];
}

/**
 * Finds the best matching Blink action by label or href, or returns the first available action.
 */
export function selectBlinkAction(
  metadata: BlinkActionMetadata,
  actionUrl: string,
  preferredLabel?: string
): BlinkActionLink | null {
  const actions = getExecutableBlinkActions(metadata, actionUrl);
  if (actions.length === 0) {
    return null;
  }

  if (!preferredLabel?.trim()) {
    return actions[0];
  }

  const normalizedTarget = preferredLabel.trim().toLowerCase();
  const exactMatch = actions.find(
    (action) =>
      action.label.trim().toLowerCase() === normalizedTarget ||
      action.href.trim().toLowerCase() === normalizedTarget
  );
  if (exactMatch) {
    return exactMatch;
  }

  const partialMatch = actions.find((action) =>
    action.label.trim().toLowerCase().includes(normalizedTarget)
  );
  return partialMatch ?? actions[0];
}

/**
 * Checks whether all required parameters for a Blink action are populated.
 */
export function hasAllRequiredBlinkParameters(
  action: BlinkActionLink,
  parameters: Record<string, string> = {}
): boolean {
  const requiredParams = (action.parameters ?? []).filter(
    (param) => param.required
  );
  for (const param of requiredParams) {
    if (!parameters[param.name]?.trim()) {
      return false;
    }
  }

  const placeholders = action.href.match(/\{([^}]+)\}/g) ?? [];
  for (const token of placeholders) {
    const key = token.slice(1, -1).trim();
    if (!parameters[key]?.trim()) {
      return false;
    }
  }

  return true;
}

/**
 * Validates that a serialized transaction returned by a Blink endpoint is non-empty base64.
 */
export function assertValidBlinkTransaction(transaction: unknown): string {
  if (typeof transaction !== 'string' || !transaction.trim()) {
    throw new Error('Blink endpoint did not return a serialized transaction.');
  }

  const normalized = transaction.trim();
  if (normalized.length % 4 !== 0 || !BASE64_TX_PATTERN.test(normalized)) {
    throw new Error('Blink endpoint returned an invalid base64 transaction.');
  }

  return normalized;
}
