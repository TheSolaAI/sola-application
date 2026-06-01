import { Tool } from 'ai';
import { z } from 'zod';
import { ToolContext, ToolResult } from '@/types/tool';

const Parameters = z.object({
  actionUrl: z
    .string()
    .url()
    .describe('The Solana Blink/Action URL to execute.'),
  label: z
    .string()
    .optional()
    .describe('Optional label of the Blink action button to execute.'),
  params: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      'Optional parameter values required by the selected Blink action.'
    ),
  autoExecute: z
    .boolean()
    .optional()
    .describe(
      'Set true only when the user explicitly asks Sola AI to perform this Blink action.'
    ),
});

export function createBlinkActionTool(context: ToolContext) {
  const blinkActionTool: Tool<typeof Parameters, ToolResult> = {
    id: 'common.blinkAction' as const,
    description:
      'Prepares a Solana Blink (Blockchain Action) for handsfree execution. Use when the user asks to open, run, or interact with a Blink URL. The custom Sola UI will fetch the Blink, select the requested action, request the transaction with the connected wallet, and ask the user to sign it without relying on the default Blink renderer.',
    parameters: Parameters,
    execute: async ({ actionUrl, label, params, autoExecute }) => {
      if (!context.publicKey) {
        return {
          success: false,
          error: 'No wallet connected',
          data: undefined,
        };
      }

      return {
        success: true,
        data: {
          actionUrl,
          label,
          params: params ?? {},
          account: context.publicKey,
          autoExecute: Boolean(autoExecute),
        },
        error: undefined,
      };
    },
  };

  return blinkActionTool;
}
