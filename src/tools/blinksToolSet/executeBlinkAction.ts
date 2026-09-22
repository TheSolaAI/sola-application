import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { BlinkPreparedAction } from '@/types/blinks';
import {
  applyActionParameters,
  assertSafeActionUrl,
  resolveActionHref,
} from '@/lib/blinks';

const Parameters = z.object({
  url: z.string().describe('The Blink URL originally loaded with getBlinkAction'),
  actionHref: z
    .string()
    .describe(
      'The href of the specific action to run, taken from the actions list returned by getBlinkAction'
    ),
  actionLabel: z
    .string()
    .optional()
    .describe('The label of the action being run, for display purposes'),
  parameters: z
    .record(z.string())
    .optional()
    .describe(
      'Values for any input parameters the action requires, keyed by parameter name'
    ),
});

/**
 * This is the custom function that initiates a Blink action on behalf of
 * Sola AI: it builds the action's transaction directly against the
 * provider's endpoint, instead of requiring the user to click through the
 * default Blink widget.
 */
export function createExecuteBlinkActionTool(context: ToolContext) {
  const executeBlinkActionTool: Tool<typeof Parameters, ToolResult> = {
    id: 'blinks.execute' as const,
    description:
      "Initiates a Blink (Solana Action) directly for the connected wallet by POSTing to the action's endpoint, without requiring the user to click through the default Blink widget. Returns a transaction ready to sign.",
    parameters: Parameters,
    execute: async ({ url, actionHref, actionLabel, parameters }) => {
      if (!context.publicKey) {
        return {
          success: false,
          error: 'No connected wallet public key provided',
          data: undefined,
        };
      }

      let target: URL;
      try {
        const resolvedHref = applyActionParameters(
          resolveActionHref(url, actionHref),
          parameters
        );
        target = assertSafeActionUrl(resolvedHref);
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Invalid Blink action URL',
          data: undefined,
        };
      }

      try {
        const response = await fetch(target.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ account: context.publicKey }),
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          return {
            success: false,
            error: `Blink provider rejected the action (status ${response.status})`,
            data: undefined,
          };
        }

        const body = (await response.json()) as {
          transaction?: string;
          message?: string;
        };

        if (!body.transaction) {
          return {
            success: false,
            error: 'Blink provider did not return a transaction to sign',
            data: undefined,
          };
        }

        const prepared: BlinkPreparedAction = {
          kind: 'prepared',
          url,
          actionHref: target.toString(),
          actionLabel: actionLabel ?? 'Blink Action',
          message: body.message,
          transactionHash: body.transaction,
        };

        return {
          success: true,
          error: undefined,
          data: prepared,
          signAndSend: true,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Unable to prepare the Blink action transaction',
          data: undefined,
        };
      }
    },
  };

  return executeBlinkActionTool;
}
