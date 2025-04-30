import { ShowLimitOrderResponse } from '@/types/jupiter';
import { ToolContext, ToolResult } from '@/types/tool';
import { Tool } from 'ai';
import { z } from 'zod';

const Parameters = z.object({});

export function createGetLimitOrderTool(context: ToolContext) {
  const getLimitOrderTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.get_limit_order' as const,
    description: 'Get the active limit orders of the user.',
    parameters: Parameters,
    execute: async (_params) => {
      if (!context.publicKey) {
        return {
          success: false,
          error: 'No public key provided',
          data: undefined,
        };
      }
      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      try {
        const res = await fetch(
          `https://wallet-service.solaai.tech/api/wallet/jup/limit-order/show?address=${context.publicKey}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${context.authToken}`,
            },
          }
        );

        if (!res.ok) {
          const errText = await res.json();
          return {
            success: false,
            error: `API error: ${res.status} - ${errText}`,
            data: undefined,
          };
        }

        const json: ShowLimitOrderResponse = await res.json();
        console.log('json', json);
        return {
          success: true,
          error: undefined,
          data: json,
          textResponse: false,
        };
      } catch (err) {
        return {
          success: false,
          error: `Fetch error: ${String(err)}`,
          data: undefined,
        };
      }
    },
  };

  return getLimitOrderTool;
}
