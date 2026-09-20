import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import {
  buildActionUrl,
  getBlinkMetadata,
  postBlinkAction,
  resolveActionHref,
} from '@/lib/blinks';
import { BlinkActionMetadata, BlinkLinkedAction } from '@/types/blink';

const Parameters = z.object({
  url: z
    .string()
    .describe(
      'The blink / Solana Action URL to load (e.g. a dial.to or dia.ly link, or any actions endpoint URL).'
    ),
  action: z
    .string()
    .optional()
    .describe(
      'The label of the action to run when the blink offers more than one (e.g. "Heads"). Omit to use the default action, or to only list the available actions when a choice is required.'
    ),
  params: z
    .record(z.string())
    .optional()
    .describe(
      'Values for parameterized actions (e.g. {"amount": "0.1"}). Required parameters must all be provided before the action can run.'
    ),
});

function normalizeActions(
  metadata: BlinkActionMetadata,
  actionUrl: string
): BlinkLinkedAction[] {
  const linked = metadata.links?.actions ?? [];
  const actions =
    linked.length > 0
      ? linked
      : metadata.label
        ? [{ label: metadata.label, href: actionUrl }]
        : [];
  return actions.map((action) => ({
    ...action,
    href: resolveActionHref(actionUrl, action.href),
  }));
}

function pickAction(
  actions: BlinkLinkedAction[],
  actionLabel?: string
): BlinkLinkedAction | undefined {
  if (!actionLabel) return undefined;
  const wanted = actionLabel.trim().toLowerCase();
  return actions.find(
    (action) =>
      action.label.trim().toLowerCase() === wanted ||
      action.label.trim().toLowerCase().includes(wanted)
  );
}

export function createBlinkActionTool(context: ToolContext) {
  const blinkActionTool: Tool<typeof Parameters, ToolResult> = {
    id: 'general.blinkAction' as const,
    description:
      'Loads a Solana blink / Action link (dial.to, dia.ly, or any Solana Actions URL) and handsfree-executes the requested action: it builds the transaction server-side and returns it with signAndSend so sign_and_send_tx can sign and send it. When no action is specified and the blink offers several, it returns the available actions instead of executing.',
    parameters: Parameters,
    execute: async (params) => {
      try {
        const metadata = await getBlinkMetadata(params.url);
        if (metadata.error?.message) {
          return {
            success: false,
            error: metadata.error.message,
            data: undefined,
          };
        }

        const actions = normalizeActions(metadata, params.url);
        const display = {
          actionUrl: params.url,
          icon: metadata.icon,
          title: metadata.title,
          description: metadata.description,
          label: metadata.label,
          actions,
        };

        const chosen =
          pickAction(actions, params.action) ??
          (actions.length === 1 ? actions[0] : undefined);

        if (!chosen) {
          return {
            success: true,
            data: {
              ...display,
              requiresActionSelection: true,
              unknownAction: params.action,
            },
          };
        }

        const missingParams = (chosen.parameters ?? [])
          .filter(
            (parameter) =>
              parameter.required !== false && !params.params?.[parameter.name]
          )
          .map((parameter) => parameter.name);
        if (missingParams.length > 0) {
          return {
            success: true,
            data: {
              ...display,
              selectedAction: chosen.label,
              missingParams,
            },
          };
        }

        if (!context.publicKey) {
          return {
            success: false,
            error: 'No wallet connected',
            data: undefined,
          };
        }

        const href = buildActionUrl(params.url, chosen, params.params);
        const result = await postBlinkAction(href, context.publicKey);

        return {
          success: true,
          data: {
            ...display,
            executedAction: chosen.label,
            transaction: result.transaction,
            message: result.message,
            signAndSend: true,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: `Unable to process blink: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: undefined,
        };
      }
    },
  };

  return blinkActionTool;
}
