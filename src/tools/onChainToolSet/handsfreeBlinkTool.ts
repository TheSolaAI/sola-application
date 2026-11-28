import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import {
  BlinkMetadata,
  handsfreeBlinkRegistry,
  isSafePublicHttpsUrl,
  matchBlinkAction,
  resolveBlinkActionHref,
} from '@/lib/blinks/handsfreeBlinkRegistry';

const HandsfreeBlinkParameters = z.object({
  blinkId: z
    .string()
    .optional()
    .describe('Optional mounted HandsfreeBlinkCard ID to invoke directly.'),
  actionUrl: z.string().url().describe('Public HTTPS Solana Action / Blink URL.'),
  actionLabel: z
    .string()
    .optional()
    .describe('Action button label to run handsfree (e.g., "Play", "Donate 0.1 SOL").'),
  parameters: z
    .record(z.string())
    .optional()
    .describe('Key-value parameters required by the selected Blink action.'),
});

export function createHandsfreeBlinkTool(context: ToolContext) {
  const handsfreeBlinkTool: Tool<typeof HandsfreeBlinkParameters, ToolResult> = {
    id: 'onChain.triggerHandsfreeBlink' as const,
    description:
      'Executes a Solana Blink action handsfree via a mounted HandsfreeBlinkCard handler or directly through the Solana Actions protocol.',
    parameters: HandsfreeBlinkParameters,
    execute: async (params) => {
      const { blinkId, actionUrl, actionLabel, parameters = {} } = params;

      if (!context.publicKey) {
        return {
          success: false,
          error: 'No wallet public key available for Blink execution.',
          data: undefined,
        };
      }

      if (!isSafePublicHttpsUrl(actionUrl)) {
        return {
          success: false,
          error: 'Only public HTTPS Blink URLs are allowed.',
          data: undefined,
        };
      }

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
        if (metadata.disabled) {
          return {
            success: false,
            error: `Blink "${metadata.title}" is currently disabled.`,
            data: undefined,
          };
        }

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
        if (!postResp.ok || !txPayload?.transaction) {
          return {
            success: false,
            error:
              txPayload?.error ||
              txPayload?.message ||
              `Blink action did not return a valid transaction (HTTP ${postResp.status}).`,
            data: undefined,
          };
        }

        return {
          success: true,
          data: {
            actionLabel: matched.label,
            resolvedHref,
            transaction: txPayload.transaction,
            signAndSend: true,
            message: txPayload.message || `Action "${matched.label}" prepared for signing.`,
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
