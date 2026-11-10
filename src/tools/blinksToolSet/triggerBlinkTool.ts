import {
  resolveBlinkActionHref,
  useBlinksHandler,
} from '@/store/BlinksHandler';
import { BlinkTriggerRequest } from '@/types/blinks';
import { ToolResult } from '@/types/tool';

export const triggerBlinkTool = async (
  args: BlinkTriggerRequest
): Promise<ToolResult> => {
  if (!args?.blinkUrl) {
    return {
      success: false,
      error: 'A valid blinkUrl is required to initiate a Blink action.',
    };
  }

  const state = useBlinksHandler.getState();
  const controller = state.controllers[args.blinkUrl];

  // Queue the handsfree trigger so the BlinksMessageItem functional component
  // can also execute or reflect the action state in real time
  state.queueHandsfreeTrigger({
    blinkUrl: args.blinkUrl,
    actionLabel: args.actionLabel,
    actionHref: args.actionHref,
    parameters: args.parameters,
    handsfree: args.handsfree ?? true,
    autoExecute: args.autoExecute ?? true,
  });

  if (controller && (args.autoExecute ?? true)) {
    try {
      const executionResult = args.actionHref
        ? await controller.initiateAction(args.actionHref, args.parameters)
        : await controller.initiateByLabel(
            args.actionLabel || '',
            args.parameters
          );
      return {
        success: executionResult.status !== 'error',
        data: executionResult,
        error: executionResult.error,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  const resolvedHref = resolveBlinkActionHref(
    args.blinkUrl,
    args.actionHref || args.blinkUrl,
    args.parameters
  );

  return {
    success: true,
    data: {
      blinkUrl: args.blinkUrl,
      executedHref: resolvedHref,
      actionLabel: args.actionLabel || 'Handsfree Blink Action',
      parameters: args.parameters,
      handsfree: args.handsfree ?? true,
      autoExecute: args.autoExecute ?? true,
      status: 'ready',
    },
  };
};
