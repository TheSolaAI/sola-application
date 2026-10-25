export const BLINKGAMES = {
  snake: 'https://snakes.sendarcade.fun/api/actions/game',
  coinflip: 'https://flip.sendarcade.fun/api/actions/website',
  rockpaperscissors:
    'https://rps.catoff.xyz/api/actions/create-rock-paper-scissors?clusterurl=mainnet',
} as const;

export type BlinkGameKey = keyof typeof BLINKGAMES;

export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface BlinkLinkedAction {
  href: string;
  label: string;
  parameters?: BlinkActionParameter[];
}

export interface BlinkMetadata {
  icon: string;
  title: string;
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

export type BlinkHandsfreeCommand =
  | 'render'
  | 'execute'
  | 'selectOption'
  | 'setInput';

export interface BlinkToolPayload {
  actionName: BlinkGameKey;
  actionUrl: string;
  command: BlinkHandsfreeCommand;
  actionLabel?: string;
  subActionHref?: string;
  parameters: Record<string, string | number>;
  autoExecute: boolean;
}

/**
 * Resolves `{param}` placeholders inside a Solana Action href using provided parameters.
 */
export function resolveBlinkActionHref(
  baseUrl: string,
  href: string,
  parameters: Record<string, string | number> = {}
): string {
  const interpolated = href.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const trimmedKey = key.trim();
    const val = parameters[trimmedKey];
    return val !== undefined && val !== null
      ? encodeURIComponent(String(val))
      : '';
  });

  try {
    return new URL(interpolated, baseUrl).toString();
  } catch {
    return interpolated;
  }
}

/**
 * Finds the best matching linked action from Blink metadata based on a voice/AI label or href hint.
 */
export function matchBlinkLinkedAction(
  metadata: BlinkMetadata,
  actionLabel?: string,
  subActionHref?: string
): BlinkLinkedAction | null {
  const actions = metadata.links?.actions || [];
  if (actions.length === 0) {
    return {
      href: '',
      label: metadata.label || 'Execute',
    };
  }

  if (subActionHref) {
    const exactHref = actions.find((a) => a.href === subActionHref);
    if (exactHref) return exactHref;
  }

  if (actionLabel) {
    const normalizedTarget = actionLabel.trim().toLowerCase();
    const matched = actions.find(
      (a) =>
        a.label.toLowerCase() === normalizedTarget ||
        a.label.toLowerCase().includes(normalizedTarget) ||
        normalizedTarget.includes(a.label.toLowerCase())
    );
    if (matched) return matched;
  }

  return actions[0];
}
