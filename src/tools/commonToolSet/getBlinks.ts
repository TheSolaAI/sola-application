import { z } from 'zod';
import { ToolResult } from '@/types/tool';
import {
  BLINKGAMES,
  BlinkGameKey,
  BlinkHandsfreeCommand,
  BlinkToolPayload,
} from '@/config/blinks/games';

export const getBlinksParametersSchema = z.object({
  actionName: z
    .enum(['coinflip', 'snake', 'rockpaperscissors'])
    .describe('Specifies the game or blink action the user wants to perform.'),
  command: z
    .enum(['render', 'execute', 'selectOption', 'setInput'])
    .optional()
    .describe(
      'Handsfree command to trigger on the custom Blink component: render the blink, execute an action immediately, select an option, or fill input parameters.'
    ),
  actionLabel: z
    .string()
    .optional()
    .describe(
      'Optional label or choice of the specific Blink button/action to trigger handsfree (e.g., "heads", "tails", "rock", "paper", "scissors", "roll").'
    ),
  subActionHref: z
    .string()
    .optional()
    .describe('Optional specific action endpoint path or href to trigger.'),
  parameters: z
    .record(z.union([z.string(), z.number()]))
    .optional()
    .describe(
      'Key-value parameters for the Blink action inputs (e.g., { amount: 0.1, choice: "heads" }).'
    ),
  autoExecute: z
    .boolean()
    .optional()
    .describe(
      'When true, automatically initiates the Blink action without requiring manual clicks.'
    ),
});

export type GetBlinksArgs = z.infer<typeof getBlinksParametersSchema>;

export const createGetBlinksTool = () => {
  return {
    description:
      'This function is called when the user wants to play a game or perform a Solana Blink (Blockchain Action) handsfree. Supports rendering the Blink, filling action parameters, selecting options, and automatically initiating the Blink transaction.',
    parameters: getBlinksParametersSchema,
  };
};

export function executeGetBlinksTool(args: GetBlinksArgs): ToolResult {
  const actionName = (args?.actionName || 'coinflip') as BlinkGameKey;
  const actionUrl = BLINKGAMES[actionName];

  if (!actionUrl) {
    return {
      success: false,
      error: `Unsupported blink action: ${String(args?.actionName)}`,
      data: undefined,
    };
  }

  const hasExplicitAction =
    Boolean(args?.actionLabel) ||
    Boolean(args?.subActionHref) ||
    Boolean(args?.parameters && Object.keys(args.parameters).length > 0);

  const command: BlinkHandsfreeCommand =
    args?.command ||
    (args?.autoExecute || hasExplicitAction ? 'execute' : 'render');

  const autoExecute =
    typeof args?.autoExecute === 'boolean'
      ? args.autoExecute
      : command === 'execute';

  const payload: BlinkToolPayload = {
    actionName,
    actionUrl,
    command,
    actionLabel: args?.actionLabel,
    subActionHref: args?.subActionHref,
    parameters: args?.parameters || {},
    autoExecute,
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sola:blink-command', { detail: payload })
    );
  }

  return {
    success: true,
    data: payload,
    error: undefined,
  };
}
