/**
 * Handsfree Solana Blinks Registry & Action Resolver for Sola AI (#157).
 * Allows AI tools / voice commands to programmatically trigger custom Blink
 * actions registered by mounted <HandsfreeBlinkCard /> components.
 */

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
  message?: string;
  error?: string;
}

export type HandsfreeBlinkHandler = (
  req: BlinkExecutionRequest
) => Promise<BlinkExecutionResponse>;

/**
 * Resolves a Solana Action href (relative or absolute) and substitutes `{param}` placeholders.
 */
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
  if (/^https?:\/\//i.test(resolved)) {
    return resolved;
  }
  const base = new URL(baseUrl);
  return new URL(resolved, base.origin).toString();
}

/**
 * Matches a user/AI spoken or typed action label against a Blink's available actions.
 */
export function matchBlinkAction(
  metadata: BlinkMetadata,
  requestedLabel?: string
): BlinkLinkedAction | null {
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

/**
 * In-memory registry bridging AI config tools and mounted HandsfreeBlinkCard components.
 */
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
        error: `No active HandsfreeBlinkCard registered for "${blinkId}".`,
      };
    }
    return await handler(req);
  }
}

export const handsfreeBlinkRegistry = new HandsfreeBlinkRegistry();
