import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import {
  BlinkMetadata,
  handsfreeBlinkRegistry,
  matchBlinkAction,
  resolveBlinkActionHref,
} from '@/lib/blinks/handsfreeBlinkRegistry';

const HandsfreeBlinkParameters = z.object({
  blinkId: z
    .string()
    .optional()
    .describe('Optional mounted HandsfreeBlinkCard ID to trigger directly in the UI.'),
  actionUrl: z
    .string()
    .url()
    .describe('Solana Action / Blink endpoint URL.'),
  actionLabel: z
    .string()
    .optional()
    .describe('Label of the Blink action to trigger handsfree (e.g., "Play", "Donate 0.1 SOL").'),
  parameters: z
    .record(z.string())
    .optional()
    .describe('Key-value parameters required by the selected Blink action.'),
});

/**
 * Extends Sola AI's toolset so voice/chat commands can trigger custom
 * Handsfree Blink actions without manual button clicks (#157).
 */
export function createHandsfreeBlinkTool(context: ToolContext) {
  const handsfreeBlinkTool: Tool<typeof HandsfreeBlinkParameters, ToolResult> = {
    id: 'onChain.triggerHandsfreeBlink' as const,
    description:
      'Triggers a Solana Blink (Blockchain Action) handsfree via the custom HandsfreeBlinkCard handler or directly via the Solana Actions protocol.',
    parameters: HandsfreeBlinkParameters,
    execute: async (params) => {
      const { blinkId, actionUrl, actionLabel, parameters = {} } = params;

      if (!context.publicKey) {
        return {
          success: false,
          error: 'No wallet public key available for handsfree Blink execution.',
          data: undefined,
        };
      }

      // 1. If a mounted HandsfreeBlinkCard is registered, trigger its custom handler directly
      if (blinkId && handsfreeBlinkRegistry.has(blinkId)) {
        const uiRes = await handsfreeBlinkRegistry.trigger(blinkId, {
          blinkUrl: actionUrl,
          actionLabel,
          parameters,
          account: context.publicKey,
        });
        return {
          success: uiRes.ok,
          data: uiRes,
          error: uiRes.error,
        };
      }

      // 2. Otherwise execute headlessly against the Solana Action endpoint
      try {
        const metaResp = await fetch(actionUrl, {
          headers: { Accept: 'application/json' },
        });
        if (!metaResp.ok) {
          return {
            success: false,
            error: `Failed to load Blink metadata (HTTP ${metaResp.status})`,
            data: undefined,
          };
        }
        const metadata = (await metaResp.json()) as BlinkMetadata;
        const matched = matchBlinkAction(metadata, actionLabel);
        if (!matched) {
          return {
            success: false,
            error: `Could not match action "${actionLabel}" in Blink "${metadata.title}".`,
            data: undefined,
          };
        }

        const resolvedHref = matched.href
          ? resolveBlinkActionHref(actionUrl, matched.href, parameters)
          : actionUrl;

        const postResp = await fetch(resolvedHref, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ account: context.publicKey }),
        });
        const txPayload = await postResp.json();
        if (!postResp.ok) {
          return {
            success: false,
            error: txPayload?.error || `Blink POST failed (HTTP ${postResp.status})`,
            data: undefined,
          };
        }

        return {
          success: true,
          data: {
            actionLabel: matched.label,
            resolvedHref,
            transaction: txPayload.transaction,
            message: txPayload.message || `Handsfree action "${matched.label}" prepared.`,
          },
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
          data: undefined,
        };
      }
    },
  };

  return handsfreeBlinkTool;
}
