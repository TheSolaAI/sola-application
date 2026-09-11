import { ToolContext, ToolResult } from '@/types/tool';
import { tool } from 'ai';
import { z } from 'zod';
import { BlinkRenderResult } from '@/types/blinks';

const PREDEFINED_BLINK_GAMES: Record<
  string,
  { title: string; description: string; actionUrl: string }
> = {
  coinflip: {
    title: 'Solana Coin Flip',
    description: 'Double or nothing on-chain coin flip game via Solana Blinks.',
    actionUrl: 'https://actions.dialect.to/api/games/coinflip',
  },
  rockpaperscissors: {
    title: 'Rock Paper Scissors',
    description:
      'Provably fair Rock Paper Scissors game powered by Solana Actions.',
    actionUrl: 'https://actions.dialect.to/api/games/rps',
  },
  dice: {
    title: 'Solana Dice Roll',
    description:
      'On-chain dice rolling game executed handsfree with Solana Blinks.',
    actionUrl: 'https://actions.dialect.to/api/games/dice',
  },
};

export const createBlinksTool = (context: ToolContext) => {
  return tool({
    description:
      'Execute or launch Solana Blinks (Blockchain Actions) games and custom action URLs handsfree. Enables instant on-chain interactions like coinflip, rockpaperscissors, dice, or custom blinks.',
    parameters: z.object({
      game: z
        .enum(['coinflip', 'rockpaperscissors', 'dice', 'custom'])
        .optional()
        .describe(
          'Predefined Solana Blink game type, or custom for arbitrary action URLs'
        ),
      actionUrl: z
        .string()
        .optional()
        .describe('Direct Solana Action URL or Blink URL to execute handsfree'),
      choice: z
        .string()
        .optional()
        .describe(
          'Selected game choice (e.g. heads, tails, rock, paper, scissors)'
        ),
      amount: z
        .number()
        .optional()
        .describe('Optional SOL or token amount to wager or transfer'),
      autoTrigger: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          'Whether to automatically trigger the action handsfree on render (default: true)'
        ),
    }),
    execute: async ({
      game,
      actionUrl,
      choice,
      amount,
      autoTrigger = true,
    }): Promise<ToolResult> => {
      try {
        let finalActionUrl = actionUrl;
        let title = 'Solana Blink Game';
        let description = 'Executing Solana Blink action handsfree.';

        if (game && PREDEFINED_BLINK_GAMES[game]) {
          const preset = PREDEFINED_BLINK_GAMES[game];
          finalActionUrl = finalActionUrl || preset.actionUrl;
          title = preset.title;
          description = preset.description;
        }

        if (!finalActionUrl) {
          return {
            success: false,
            error:
              'Either a valid game identifier or actionUrl must be provided.',
          };
        }

        const data: BlinkRenderResult = {
          actionUrl: finalActionUrl,
          title,
          description,
          game: game || 'custom',
          autoTrigger,
          params: {
            choice,
            amount,
          },
        };

        return {
          success: true,
          data,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error?.message || 'Failed to initialize Solana Blink action',
        };
      }
    },
  });
};
