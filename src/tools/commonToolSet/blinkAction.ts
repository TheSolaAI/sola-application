import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import {
  assertSafeBlinkUrl,
  BlinkActionMessageData,
} from '@/lib/blinks/actionExecutor';

const BlinkActionParameters = z.object({
  actionUrl: z
    .string()
    .describe(
      'HTTPS Solana Blink or Blockchain Action URL (or solana-action: URL) to load and interact with.'
    ),
  actionLabel: z
    .string()
    .optional()
    .describe(
      'Optional Blink action button label or href to select and trigger automatically.'
    ),
  parameters: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      'Optional key-value map of Blink action input parameters for templated action URLs.'
    ),
  autoExecute: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'When true, automatically initiates the selected Blink action handsfree once loaded.'
    ),
});

export function createBlinkActionTool(context: ToolContext) {
  const blinkActionTool: Tool<typeof BlinkActionParameters, ToolResult> = {
    id: 'common.blinkAction' as const,
    description:
      'Loads a Solana Blink (Blockchain Action) and triggers its custom action handlers handsfree without requiring manual button clicks.',
    parameters: BlinkActionParameters,
    execute: async (params) => {
      try {
        const safeUrl = assertSafeBlinkUrl(params.actionUrl);

        const data: BlinkActionMessageData = {
          actionUrl: safeUrl.toString(),
          actionLabel: params.actionLabel?.trim() || undefined,
          parameters: params.parameters ?? {},
          autoExecute: params.autoExecute ?? true,
          walletAddress: context.publicKey,
        };

        return {
          success: true,
          data,
          error: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Invalid Blink action URL.',
          data: undefined,
        };
      }
    },
  };

  return blinkActionTool;
}
