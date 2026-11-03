export interface BlinkLinkedAction {
  label: string;
  href: string;
  parameters?: Array<{ name: string; label?: string; required?: boolean }>;
}

export interface HandsfreeBlinkMatch {
  action: BlinkLinkedAction;
  resolvedHref: string;
  requiresVoiceConfirmation: boolean;
}

/**
 * Matches a user's spoken transcript against available Solana Blink actions for hands-free execution (#157).
 */
export function matchHandsfreeBlinkAction(
  transcript: string,
  actions: BlinkLinkedAction[],
  parameterValues: Record<string, string> = {}
): HandsfreeBlinkMatch | null {
  const normalized = (transcript || "").trim().toLowerCase();
  if (!normalized || !actions?.length) return null;

  const matched =
    actions.find((a) => normalized.includes(a.label.toLowerCase())) ?? actions[0];

  let resolvedHref = matched.href;
  for (const param of matched.parameters ?? []) {
    const val = parameterValues[param.name] ?? "";
    resolvedHref = resolvedHref.replace(`{${param.name}}`, encodeURIComponent(val));
  }

  return {
    action: matched,
    resolvedHref,
    requiresVoiceConfirmation: true,
  };
}
