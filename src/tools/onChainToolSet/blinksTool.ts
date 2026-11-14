import { z } from 'zod';
import { ToolContext, ToolResult } from '@/types/tool';
import {
  BlinkActionMetadata,
  BlinkExecutionResult,
  BlinkMessageItemProps,
} from '@/types/blinks';
import {
  buildParameterizedActionHref,
  resolveBlinkActionUrl,
  triggerHandsfreeBlinkCommand,
} from '@/components/messages/BlinkMessageItem';

export const executeBlinkActionParameters = z.object({
  actionUrl: z
    .string()
    .describe('The Solana Blink / Action URL (https://... or solana-action:...)'),
  actionLabelOrHref: z
    .string()
    .optional()
    .describe(
      'Optional label or href of the specific Blink action button or game move to initiate handsfree'
    ),
  params: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional()
    .describe('Optional map of parameter values required by the Blink action'),
  account: z
    .string()
    .optional()
    .describe('User Solana wallet public key initiating the Blink action'),
  autoExecute: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to automatically initiate the Blink action handsfree'),
});

export type ExecuteBlinkActionArgs = z.infer<typeof executeBlinkActionParameters>;

/**
 * Fetches Blink metadata and optionally initiates the selected action handsfree,
 * returning a transaction ready for `sign_and_send_tx`.
 */
export async function executeHandsfreeBlinkAction(
  args: ExecuteBlinkActionArgs,
  context?: ToolContext
): Promise<ToolResult> {
  const endpoint = resolveBlinkActionUrl(args.actionUrl);
  const walletAccount = args.account || context?.publicKey || '';

  try {
    const metaRes = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!metaRes.ok) {
      return {
        success: false,
        error: `Failed to fetch Blink metadata from ${endpoint} (HTTP ${metaRes.status})`,
      };
    }

    const metadata = (await metaRes.json()) as BlinkActionMetadata;

    if (typeof window !== 'undefined') {
      triggerHandsfreeBlinkCommand({
        actionUrl: args.actionUrl,
        actionLabelOrHref: args.actionLabelOrHref,
        params: args.params,
        account: walletAccount,
        autoExecute: args.autoExecute,
        autoSignAndSend: true,
      });
    }

    if (args.autoExecute && walletAccount) {
      const actions = metadata.links?.actions || [];
      let selectedHref = endpoint;

      if (args.actionLabelOrHref) {
        const match = actions.find(
          (a) =>
            a.label.toLowerCase() === args.actionLabelOrHref!.toLowerCase() ||
            a.href === args.actionLabelOrHref
        );
        selectedHref = match ? match.href : args.actionLabelOrHref;
      } else if (actions.length > 0) {
        selectedHref = actions[0].href;
      }

      const postUrl = buildParameterizedActionHref(
        endpoint,
        selectedHref,
        args.params || {}
      );

      const postRes = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: walletAccount }),
      });

      if (postRes.ok) {
        const postData = await postRes.json();
        const executionData: BlinkMessageItemProps & BlinkExecutionResult = {
          success: true,
          actionUrl: args.actionUrl,
          executedHref: postUrl,
          metadata,
          autoExecuteAction: args.actionLabelOrHref,
          autoParams: args.params,
          account: walletAccount,
          transaction: postData.transaction,
          message: postData.message,
          signAndSend: Boolean(postData.transaction),
        };
        return {
          success: true,
          data: executionData,
        };
      }
    }

    const renderData: BlinkMessageItemProps = {
      actionUrl: args.actionUrl,
      metadata,
      autoExecuteAction: args.actionLabelOrHref,
      autoParams: args.params,
      account: walletAccount,
    };

    return {
      success: true,
      data: renderData,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Handsfree Blink execution failed',
    };
  }
}

export const executeBlinkActionTool = {
  description:
    'Inspects a Solana Blink (Blockchain Action / Blink game) URL and initiates its custom actions handsfree via voice or AI parameters.',
  parameters: executeBlinkActionParameters,
  execute: (args: ExecuteBlinkActionArgs, context?: ToolContext) =>
    executeHandsfreeBlinkAction(args, context),
};
