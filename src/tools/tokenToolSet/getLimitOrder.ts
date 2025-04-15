import { API_URLS } from '@/config/api_urls';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
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
      const apiClient = createServerApiClient(context.authToken);
      const response = await apiClient.get<ShowLimitOrderResponse>(
        API_URLS.WALLET.LIMIT_ORDER.SHOW + '?address=' + context.publicKey,
        undefined,
        'wallet'
      );
      if (ApiClient.isApiResponse<ShowLimitOrderResponse>(response)) {
        return {
          success: true,
          error: undefined,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: 'Failed to get limit order',
          data: undefined,
        };
      }
    },
  };

  return getLimitOrderTool;
}
