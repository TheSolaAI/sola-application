import { z } from 'zod';
import { ToolContext } from '@/types/tool';
import {
  BLINKGAMES,
  HandsfreeBlinkToolPayload,
  resolveBlinkActionUrl,
} from '@/config/blinks/games';

const functionDescription =
  'Call this function when the user wants to play a Solana Blink game (coinflip, snake, rockpaperscissors) or execute a Solana Blockchain Action (Blink) handsfree. Supports custom action selection, parameter injection, and automatic transaction initiation.';

export const createGetBlinksTool = (context: ToolContext) => ({
  description: functionDescription,
  parameters: z.object({
    actionName: z
      .enum(['coinflip', 'snake', 'rockpaperscissors'])
      .or(z.string())
      .describe(
        'Specifies the Blink game (coinflip, snake, rockpaperscissors) or direct Solana Action URL to interact with.'
      ),
    actionLabel: z
      .string()
      .optional()
      .describe(
        'Optional label or keyword of the specific Blink action button to trigger (e.g. "Heads", "Tails", "Play", "Rock").'
      ),
    customTrigger: z
      .enum(['load', 'initiate', 'auto_execute'])
      .optional()
      .default('auto_execute')
      .describe(
        'Custom trigger mode: "auto_execute" initiates the matching Blink action handsfree when rendered.'
      ),
    parameters: z
      .record(z.string(), z.union([z.string(), z.number()]))
      .optional()
      .describe(
        'Optional key-value input parameters required by parameterized Blink actions (e.g. bet amount, choice, player move).'
      ),
    autoExecute: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'When true, automatically triggers the matched Blink action handler handsfree upon rendering.'
      ),
  }),
  execute: async ({
    actionName,
    actionLabel,
    customTrigger = 'auto_execute',
    parameters = {},
    autoExecute = true,
  }: {
    actionName: string;
    actionLabel?: string;
    customTrigger?: 'load' | 'initiate' | 'auto_execute';
    parameters?: Record<string, string | number>;
    autoExecute?: boolean;
  }) => {
    try {
      const actionUrl = resolveBlinkActionUrl(actionName);
      if (!actionUrl || (!actionUrl.startsWith('http://') && !actionUrl.startsWith('https://'))) {
        return {
          success: false,
          error: `Unsupported Blink game or invalid action URL: ${actionName}. Available games: ${Object.keys(BLINKGAMES).join(', ')}`,
        };
      }

      const payload: HandsfreeBlinkToolPayload = {
        actionName,
        actionUrl,
        customTrigger,
        actionLabel,
        parameters,
        autoExecute: autoExecute || customTrigger === 'auto_execute',
        walletAddress: context.publicKey ?? null,
      };

      return {
        success: true,
        data: payload,
        textResponse: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to prepare handsfree Blink interaction',
      };
    }
  },
});
