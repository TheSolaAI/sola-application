import type {
  BlinkLinkedAction,
  BlinkMetadata,
  LinkedActionType,
} from '../../types/blink';

export function isBlinkMetadata(value: unknown): value is BlinkMetadata {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as BlinkMetadata;
  return Boolean(
    candidate.title ||
      candidate.label ||
      candidate.description ||
      candidate.links?.actions?.length
  );
}

export function getLinkedActions(
  metadata: BlinkMetadata | null | undefined,
  fallbackUrl: string
): BlinkLinkedAction[] {
  const actions = metadata?.links?.actions;
  if (actions?.length) {
    return actions
      .filter((action): action is BlinkLinkedAction => Boolean(action))
      .map((action) => ({
        type: action.type ?? 'transaction',
        href: action.href || fallbackUrl,
        label: action.label?.trim() || metadata?.label || 'Run Blink',
        parameters: action.parameters,
      }));
  }

  return [
    {
      type: 'transaction',
      href: fallbackUrl,
      label: metadata?.label || 'Run Blink',
    },
  ];
}

const actionSearchLabel = (action: BlinkLinkedAction) =>
  (action.label ?? '').trim().toLowerCase();

export function findRequestedAction(
  actions: BlinkLinkedAction[],
  requestedLabel?: string
): BlinkLinkedAction | undefined {
  if (!actions.length) return undefined;
  if (!requestedLabel) return actions[0];

  const needle = requestedLabel.trim().toLowerCase();
  if (!needle) return actions[0];

  return (
    actions.find((action) => actionSearchLabel(action) === needle) ??
    actions.find((action) => {
      const label = actionSearchLabel(action);
      return label.length > 0 && label.includes(needle);
    }) ??
    actions.find((action) => {
      const label = actionSearchLabel(action);
      return label.length > 0 && needle.includes(label);
    }) ??
    actions[0]
  );
}

export function sanitizeHttpUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeActionType(
  type: string | undefined,
  payload: { transaction?: string; externalLink?: string; data?: unknown }
): LinkedActionType {
  if (
    type === 'transaction' ||
    type === 'message' ||
    type === 'post' ||
    type === 'external-link'
  ) {
    return type;
  }

  if (payload.transaction) return 'transaction';
  if (payload.externalLink) return 'external-link';
  if (typeof payload.data === 'string' || payload.data) return 'message';
  return 'post';
}
