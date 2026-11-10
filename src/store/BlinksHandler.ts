import { create } from 'zustand';
import {
  BlinkActionMetadata,
  BlinkExecutionResult,
  BlinkLinkedAction,
  BlinkTriggerRequest,
} from '@/types/blinks';

export interface CustomBlinkController {
  initiateAction: (
    actionHref: string,
    params?: Record<string, string | number>
  ) => Promise<BlinkExecutionResult>;
  initiateByLabel: (
    actionLabel: string,
    params?: Record<string, string | number>
  ) => Promise<BlinkExecutionResult>;
}

interface BlinksHandlerState {
  activeBlinkUrl: string | null;
  activeMetadata: BlinkActionMetadata | null;
  pendingTrigger: BlinkTriggerRequest | null;
  lastExecutionResult: BlinkExecutionResult | null;
  controllers: Record<string, CustomBlinkController>;
  setActiveBlink: (
    blinkUrl: string,
    metadata?: BlinkActionMetadata | null
  ) => void;
  registerBlinkController: (
    blinkUrl: string,
    controller: CustomBlinkController
  ) => void;
  unregisterBlinkController: (blinkUrl: string) => void;
  queueHandsfreeTrigger: (trigger: BlinkTriggerRequest) => void;
  clearPendingTrigger: () => void;
  setLastExecutionResult: (result: BlinkExecutionResult | null) => void;
}

export function resolveBlinkActionHref(
  baseBlinkUrl: string,
  actionHref: string,
  parameters?: Record<string, string | number>
): string {
  let interpolated = actionHref;
  if (parameters) {
    for (const [key, val] of Object.entries(parameters)) {
      interpolated = interpolated.replace(
        new RegExp(`\\{${key}\\}`, 'g'),
        encodeURIComponent(String(val))
      );
    }
  }
  try {
    return new URL(interpolated, baseBlinkUrl).toString();
  } catch {
    return interpolated;
  }
}

export function matchBlinkAction(
  metadata: BlinkActionMetadata,
  baseBlinkUrl: string,
  actionLabelOrName?: string,
  actionHref?: string
): BlinkLinkedAction {
  const actions = metadata.links?.actions ?? [];
  if (actionHref) {
    const byHref = actions.find((a) => a.href === actionHref);
    if (byHref) return byHref;
    return { href: actionHref, label: actionLabelOrName || metadata.label };
  }
  if (actionLabelOrName) {
    const normalized = actionLabelOrName.trim().toLowerCase();
    const matched = actions.find(
      (a) =>
        a.label.toLowerCase() === normalized ||
        a.label.toLowerCase().includes(normalized) ||
        a.href.toLowerCase().includes(normalized)
    );
    if (matched) return matched;
  }
  if (actions.length > 0) {
    return actions[0];
  }
  return {
    href: baseBlinkUrl,
    label: metadata.label || 'Execute Action',
  };
}

export const useBlinksHandler = create<BlinksHandlerState>((set) => ({
  activeBlinkUrl: null,
  activeMetadata: null,
  pendingTrigger: null,
  lastExecutionResult: null,
  controllers: {},

  setActiveBlink: (blinkUrl, metadata = null) =>
    set({
      activeBlinkUrl: blinkUrl,
      activeMetadata: metadata,
    }),

  registerBlinkController: (blinkUrl, controller) =>
    set((state) => ({
      controllers: {
        ...state.controllers,
        [blinkUrl]: controller,
      },
    })),

  unregisterBlinkController: (blinkUrl) =>
    set((state) => {
      const next = { ...state.controllers };
      delete next[blinkUrl];
      return { controllers: next };
    }),

  queueHandsfreeTrigger: (trigger) =>
    set({
      activeBlinkUrl: trigger.blinkUrl,
      pendingTrigger: {
        ...trigger,
        handsfree: trigger.handsfree ?? true,
        autoExecute: trigger.autoExecute ?? true,
      },
    }),

  clearPendingTrigger: () => set({ pendingTrigger: null }),

  setLastExecutionResult: (result) => set({ lastExecutionResult: result }),
}));
