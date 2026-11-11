import { ToolContext, ToolSetDescription } from '@/types/tool';
import { z } from 'zod';

export const blinksToolSet: ToolSetDescription = {
  slug: 'blinks',
  name: 'blinks_tools',
  description:
    'Handsfree Solana Blinks (Blockchain Actions) and Blinks games tools for rendering Blinks and triggering custom Blink actions via voice or chat commands.',
};

export const getBlinksToolSet = (_context: ToolContext) => {
  return {
    ...blinksToolSet,
    tools: {
      triggerBlinkAction: {
        description:
          'Render a Solana Blink (Blockchain Action / Game) and handsfree-trigger a custom Blink action by label or href with optional parameters.',
        parameters: z.object({
          blinkUrl: z
            .string()
            .url()
            .describe('The Solana Action / Blink endpoint URL to interact with'),
          actionLabel: z
            .string()
            .optional()
            .describe(
              'Label or command name of the Blink action button to trigger handsfree (e.g. "Play", "Bet 0.1 SOL", "Mint")'
            ),
          actionHref: z
            .string()
            .optional()
            .describe(
              'Optional specific action href template from the Blink metadata links.actions array'
            ),
          parameters: z
            .record(z.string(), z.union([z.string(), z.number()]))
            .optional()
            .describe(
              'Key-value map of action parameters to fill into parameterized Blink inputs'
            ),
          handsfree: z
            .boolean()
            .optional()
            .default(true)
            .describe(
              'Whether to automatically initiate the custom Blink action without manual button clicks'
            ),
          autoExecute: z
            .boolean()
            .optional()
            .default(true)
            .describe(
              'Whether to immediately execute the matched action when the Blink loads'
            ),
        }),
      },
    },
  };
};
