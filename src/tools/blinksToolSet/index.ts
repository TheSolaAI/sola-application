import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult, ToolSetDescription } from '@/types/tool';
import {
  fetchBlinkMetadata,
  requestBlinkTransaction,
  BlinkMetadata,
  BlinkActionPayload,
} from './actions';

export const blinksToolSet: ToolSetDescription = {
  slug: 'blinks',
  name: 'Blinks',
  description:
    'Tools for interacting with Solana Blinks and Actions hands-free or interactively.',
};

export function createExecuteBlinkActionTool(context: ToolContext) {
  const Parameters = z.object({
    action_url: z
      .string()
      .describe('The Solana Action or Blink URL (e.g. "https://dial.to/..." or "solana-action:...")'),
    action_href: z
      .string()
      .optional()
      .describe('Specific action href from metadata links.actions if executing a sub-action'),
    params: z
      .record(z.string(), z.string())
      .optional()
      .describe('Key-value parameters to fill in action URL template tokens (e.g. { amount: "0.1" })'),
    auto_execute: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether to auto-execute the transaction hands-free if a wallet is connected'),
  });

  const executeBlinkActionTool: Tool<typeof Parameters, ToolResult> = {
    id: 'blinks.executeBlinkAction' as const,
    description:
      'Execute a Solana Action or Blink hands-free. Resolves metadata, populates parameters, and prepares the signable transaction for active wallet confirmation.',
    parameters: Parameters,

    execute: async (params) => {
      try {
        const actionUrl = params.action_url?.trim();
        if (!actionUrl) {
          return {
            success: false,
            error: 'Please provide a valid Blink action_url.',
            data: undefined,
          };
        }

        const account = context.publicKey || context.walletAddress;

        // If wallet address is present and auto_execute is requested, prepare transaction payload directly
        if (account) {
          try {
            const { metadata, transactionPayload, resolvedHref } =
              await requestBlinkTransaction(
                actionUrl,
                account,
                params.action_href,
                params.params
              );

            return {
              success: true,
              data: {
                type: 'blink_action',
                actionUrl,
                resolvedHref,
                metadata,
                transactionPayload,
                account,
                autoExecute: params.auto_execute !== false,
                status: 'ready',
                sender: 'system',
                timestamp: new Date().toISOString(),
              },
              error: undefined,
            };
          } catch (txErr: any) {
            console.warn('Direct transaction preparation encountered error, falling back to metadata:', txErr.message);
          }
        }

        // Fallback: Resolve metadata for interactive card display
        const metadata = await fetchBlinkMetadata(actionUrl);
        return {
          success: true,
          data: {
            type: 'blink_action',
            actionUrl,
            metadata,
            params: params.params,
            account,
            autoExecute: Boolean(params.auto_execute && account),
            status: 'ready',
            sender: 'system',
            timestamp: new Date().toISOString(),
          },
          error: undefined,
        };
      } catch (error: any) {
        console.error('Error in executeBlinkAction tool:', error);
        return {
          success: false,
          error: error.message || 'Failed to process Blink action.',
          data: undefined,
        };
      }
    },
  };

  return executeBlinkActionTool;
}

export function createResolveBlinkMetadataTool(context: ToolContext) {
  const Parameters = z.object({
    action_url: z
      .string()
      .describe('The Solana Action or Blink URL to inspect'),
  });

  const resolveBlinkMetadataTool: Tool<typeof Parameters, ToolResult> = {
    id: 'blinks.resolveBlinkMetadata' as const,
    description:
      'Inspect a Solana Blink or Action URL, returning its title, icon, description, and available actions.',
    parameters: Parameters,

    execute: async (params) => {
      try {
        const actionUrl = params.action_url?.trim();
        if (!actionUrl) {
          return {
            success: false,
            error: 'Action URL is required',
            data: undefined,
          };
        }

        const metadata = await fetchBlinkMetadata(actionUrl);
        return {
          success: true,
          data: {
            type: 'blink_metadata',
            actionUrl,
            metadata,
            sender: 'system',
            timestamp: new Date().toISOString(),
          },
          error: undefined,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to resolve Blink metadata.',
          data: undefined,
        };
      }
    },
  };

  return resolveBlinkMetadataTool;
}

export const getBlinksToolSet = (context: ToolContext) => {
  return {
    ...blinksToolSet,
    tools: {
      executeBlinkAction: createExecuteBlinkActionTool(context),
      resolveBlinkMetadata: createResolveBlinkMetadataTool(context),
    },
  };
};
