import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';

export interface BlinkParameter {
  name: string;
  label?: string;
  required?: boolean;
}

export interface LinkedBlinkAction {
  label: string;
  href: string;
  parameters?: BlinkParameter[];
}

export interface BlinkActionMetadata {
  icon?: string;
  title: string;
  description: string;
  label: string;
  links?: {
    actions: LinkedBlinkAction[];
  };
}

export function resolveBlinkActionHref(
  actionUrl: string,
  href: string,
  parameters: Record<string, string | number> = {}
): string {
  const interpolated = href.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const val = parameters[key];
    if (val === undefined || val === '') {
      throw new Error(`Missing required Blink parameter: ${key}`);
    }
    return encodeURIComponent(String(val));
  });
  return new URL(interpolated, actionUrl).toString();
}

const Parameters = z.object({
  actionUrl: z
    .string()
    .url()
    .describe('Solana Action / Blink URL to inspect or execute hands-free.'),
  actionLabel: z
    .string()
    .optional()
    .describe(
      'Optional spoken label or button name of the Blink action to trigger.'
    ),
  parameters: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .optional()
    .describe(
      'Key-value parameters for parameterized Blink actions (e.g. amount, choice, level).'
    ),
  autoExecute: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'When true, immediately builds the serialized Solana transaction for hands-free execution.'
    ),
});

export function createExecuteBlinkActionTool(context: ToolContext) {
  const executeBlinkActionTool: Tool<typeof Parameters, ToolResult> = {
    id: 'blinks.executeBlinkAction' as const,
    description:
      'Fetches Solana Blink (Blockchain Action) metadata and initiates a hands-free Blink action by resolving action parameters and requesting a signable transaction.',
    parameters: Parameters,
    execute: async (params) => {
      const {
        actionUrl,
        actionLabel,
        parameters = {},
        autoExecute = true,
      } = params;

      if (!context.publicKey) {
        return {
          success: false,
          error: 'No wallet public key connected for hands-free Blink action',
          data: undefined,
        };
      }

      try {
        const metaRes = await fetch(actionUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!metaRes.ok) {
          return {
            success: false,
            error: `Failed to fetch Blink metadata (${metaRes.status})`,
            data: undefined,
          };
        }

        const metadata: BlinkActionMetadata = await metaRes.json();
        const availableActions: LinkedBlinkAction[] =
          metadata.links?.actions && metadata.links.actions.length > 0
            ? metadata.links.actions
            : [{ label: metadata.label || 'Execute', href: actionUrl }];

        const selectedAction =
          (actionLabel
            ? availableActions.find(
                (a) =>
                  a.label.toLowerCase().includes(actionLabel.toLowerCase()) ||
                  actionLabel.toLowerCase().includes(a.label.toLowerCase())
              )
            : availableActions[0]) || availableActions[0];

        if (!autoExecute) {
          return {
            success: true,
            data: {
              actionUrl,
              metadata,
              selectedAction,
              parameters,
              autoExecute: false,
            },
            error: undefined,
          };
        }

        const targetEndpoint = resolveBlinkActionHref(
          actionUrl,
          selectedAction.href,
          parameters
        );

        const txRes = await fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ account: context.publicKey }),
        });

        if (!txRes.ok) {
          return {
            success: false,
            error: `Blink action POST failed (${txRes.status})`,
            data: undefined,
          };
        }

        const txPayload = await txRes.json();
        if (
          !txPayload?.transaction ||
          typeof txPayload.transaction !== 'string'
        ) {
          return {
            success: false,
            error: 'Blink action response did not include a base64 transaction',
            data: undefined,
          };
        }

        return {
          success: true,
          data: {
            actionUrl,
            targetEndpoint,
            metadata,
            selectedAction,
            parameters,
            transaction: txPayload.transaction,
            message: txPayload.message,
            autoExecute: true,
          },
          error: undefined,
          signAndSend: true,
        };
      } catch (error) {
        return {
          success: false,
          error: `Hands-free Blink execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: undefined,
        };
      }
    },
  };

  return executeBlinkActionTool;
}
