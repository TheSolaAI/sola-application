export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
}

export interface BlinkLinkedAction {
  label: string;
  href: string;
  parameters?: BlinkActionParameter[];
}

export interface BlinkMetadata {
  icon?: string;
  title: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions?: BlinkLinkedAction[];
  };
}

export interface BlinkExecutionRequest {
  blinkUrl: string;
  actionLabel?: string;
  parameters?: Record<string, string>;
  account?: string;
}

export interface BlinkExecutionResponse {
  ok: boolean;
  actionLabel: string;
  resolvedHref: string;
  transaction?: string;
  signAndSend?: boolean;
  message?: string;
  error?: string;
}

export type HandsfreeBlinkHandler = (
  req: BlinkExecutionRequest
) => Promise<BlinkExecutionResponse>;

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
  /\.local$/i,
  /\.internal$/i,
];

/**
 * Validates that a Blink URL is public HTTPS to prevent SSRF against internal services.
 */
export function isSafePublicHttpsUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    return !PRIVATE_HOST_PATTERNS.some((rx) => rx.test(host));
  } catch {
    return false;
  }
}

export function resolveBlinkActionHref(
  baseUrl: string,
  href: string,
  params: Record<string, string> = {}
): string {
  let resolved = href;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replace(
      new RegExp(`\\{${key}\\}`, 'g'),
      encodeURIComponent(String(value))
    );
  }
  const finalUrl = /^https?:\/\//i.test(resolved)
    ? resolved
    : new URL(resolved, new URL(baseUrl).origin).toString();

  if (!isSafePublicHttpsUrl(finalUrl)) {
    throw new Error('Blocked unsafe or non-HTTPS Blink action URL.');
  }
  return finalUrl;
}

export function matchBlinkAction(
  metadata: BlinkMetadata,
  requestedLabel?: string
): BlinkLinkedAction | null {
  if (metadata.disabled) {
    return null;
  }
  const actions = metadata.links?.actions;
  if (!actions || actions.length === 0) {
    return { label: metadata.label || 'Execute', href: '' };
  }
  if (!requestedLabel || !requestedLabel.trim()) {
    return actions[0];
  }
  const needle = requestedLabel.trim().toLowerCase();
  const exact = actions.find((a) => a.label.toLowerCase() === needle);
  if (exact) return exact;
  const partial = actions.find(
    (a) =>
      a.label.toLowerCase().includes(needle) ||
      needle.includes(a.label.toLowerCase())
  );
  return partial || null;
}

export class HandsfreeBlinkRegistry {
  private readonly handlers = new Map<string, HandsfreeBlinkHandler>();

  register(blinkId: string, handler: HandsfreeBlinkHandler): () => void {
    this.handlers.set(blinkId, handler);
    return () => {
      if (this.handlers.get(blinkId) === handler) {
        this.handlers.delete(blinkId);
      }
    };
  }

  has(blinkId: string): boolean {
    return this.handlers.has(blinkId);
  }

  listRegisteredIds(): string[] {
    return Array.from(this.handlers.keys());
  }

  async trigger(
    blinkId: string,
    req: BlinkExecutionRequest
  ): Promise<BlinkExecutionResponse> {
    const handler = this.handlers.get(blinkId);
    if (!handler) {
      return {
        ok: false,
        actionLabel: req.actionLabel || '',
        resolvedHref: req.blinkUrl,
        error: `No active Blink handler registered for "${blinkId}".`,
      };
    }
    return await handler(req);
  }
}

export const handsfreeBlinkRegistry = new HandsfreeBlinkRegistry();
