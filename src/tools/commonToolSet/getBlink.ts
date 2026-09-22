import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { resolveBlinkActionUrl } from '@/lib/blinks/urlSafety';

const Parameters = z.object({
  blinkUrl: z
    .string()
    .describe(
      'A Solana Blink / Blockchain Action URL (or dial.to share link) to prepare for handsfree execution'
    ),
  autoExecute: z
    .boolean()
    .optional()
    .describe(
      'If true, the UI should auto-load metadata and attempt handsfree execution without requiring a manual click'
    ),
  note: z
    .string()
    .optional()
    .describe('Optional short note explaining what this blink does'),
});

export function createGetBlinkTool(_context: ToolContext) {
  const getBlinkTool: Tool<typeof Parameters, ToolResult> = {
    id: 'common.getBlink' as const,
    description:
      'Prepare a Solana Blink / Blockchain Action for handsfree interaction. Use when the user provides a blink URL, dial.to link, or asks to run a blink game/action without clicking the default Dialect UI.',
    parameters: Parameters,
    execute: async (params) => {
      try {
        const resolved = resolveBlinkActionUrl(params.blinkUrl);
        return {
          success: true,
          error: undefined,
          data: {
            type: 'blink_action',
            blinkUrl: resolved,
            originalUrl: params.blinkUrl,
            autoExecute: params.autoExecute ?? false,
            note: params.note || null,
          },
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Invalid blink URL',
          data: undefined,
        };
      }
    },
  };

  return getBlinkTool;
}
