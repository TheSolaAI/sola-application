import { Tool } from 'ai';
import { z } from 'zod';
import { ToolContext, ToolResult } from '@/types/tool';
import { findKnownBlinkGame, KNOWN_BLINK_GAME_IDS } from '@/config/blinks';
import { parseBlinkUrl } from '@/lib/blinks/url';
import {
  blinkWalletError,
  shouldAutoExecuteBlink,
} from '@/lib/blinks/toolPolicy';
import type { BlinkToolData } from '@/types/blink';

const Parameters = z.object({
  actionUrl: z
    .string()
    .optional()
    .describe(
      'A Solana Blink/Action URL. Accepts https Action URLs, solana-action: links, or dial.to interstitial URLs.'
    ),
  actionName: z
    .string()
    .optional()
    .describe(
      `Known Blink game id when the user did not provide a URL. One of: ${KNOWN_BLINK_GAME_IDS.join(', ')}.`
    ),
  label: z
    .string()
    .optional()
    .describe('Optional label of the Blink action button to execute.'),
  params: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      'Parameter values from the user for the selected Blink action (amount, choice, etc).'
    ),
  autoExecute: z
    .boolean()
    .optional()
    .describe(
      'True when the user asked Sola to play, run, or complete the Blink. False only when they asked to preview it.'
    ),
});

export function createBlinkActionTool(context: ToolContext) {
  const blinkActionTool: Tool<typeof Parameters, ToolResult> = {
    id: 'common.blinkAction' as const,
    description:
      'Opens a Solana Blink (Blockchain Action) in Sola custom UI and can execute it handsfree. Use for Blink/Action URLs and known games such as coin flip, snakes, and rock paper scissors. Do not tell the user to click a third-party Blink renderer.',
    parameters: Parameters,
    execute: async ({ actionUrl, actionName, label, params, autoExecute }) => {
      const walletError = blinkWalletError(autoExecute, context.publicKey);
      if (walletError) {
        return {
          success: false,
          error: walletError,
          data: undefined,
        };
      }

      const input = actionUrl || actionName;
      if (!input) {
        return {
          success: false,
          error:
            'Provide a Blink URL or a known game name (coinflip, snake, rockpaperscissors).',
          data: undefined,
        };
      }

      try {
        const parsed = parseBlinkUrl(input, findKnownBlinkGame);
        const known = findKnownBlinkGame(actionName || parsed.gameId);

        const data: BlinkToolData = {
          actionUrl: parsed.actionUrl,
          actionName: known?.id || parsed.gameId,
          title: known?.title || parsed.title,
          label,
          params: params ?? {},
          account: context.publicKey,
          autoExecute: shouldAutoExecuteBlink(autoExecute),
        };

        return {
          success: true,
          data,
          error: undefined,
          textResponse: false,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'A valid Blink action URL is required',
          data: undefined,
        };
      }
    },
  };

  return blinkActionTool;
}
