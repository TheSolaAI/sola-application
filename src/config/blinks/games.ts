export const BLINKGAMES = {
  snake: 'https://snakes.sendarcade.fun/api/actions/game',
  coinflip: 'https://flip.sendarcade.fun/api/actions/website',
  rockpaperscissors:
    'https://rps.catoff.xyz/api/actions/create-rock-paper-scissors?clusterurl=mainnet',
} as const;

export type BlinkGameKey = keyof typeof BLINKGAMES;

export interface BlinkActionInputParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface LinkedBlinkAction {
  label: string;
  href: string;
  parameters?: BlinkActionInputParameter[];
}

export interface BlinkActionMetadata {
  icon: string;
  title: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions?: LinkedBlinkAction[];
  };
  error?: {
    message: string;
  };
}

export interface HandsfreeBlinkToolPayload {
  actionName: BlinkGameKey | string;
  actionUrl: string;
  customTrigger?: string;
  actionLabel?: string;
  parameters?: Record<string, string | number>;
  autoExecute: boolean;
  walletAddress?: string | null;
}

export function resolveBlinkActionUrl(actionNameOrUrl: string): string {
  const normalized = actionNameOrUrl.trim().toLowerCase();
  if (normalized in BLINKGAMES) {
    return BLINKGAMES[normalized as BlinkGameKey];
  }
  if (actionNameOrUrl.startsWith('solana-action:')) {
    return actionNameOrUrl.replace(/^solana-action:/i, '');
  }
  return actionNameOrUrl.trim();
}
