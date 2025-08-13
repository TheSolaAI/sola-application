import { z } from 'zod';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { TokenDataResponse } from '@/types/token';
import { ToolContext, ToolResult } from '@/types/tool';
import { Tool } from 'ai';

export const createGetTokenDataTool = (context: ToolContext) => {
  const Parameters = z.object({
    token_address: z
      .string()
      .describe(
        'The exact token contract address, symbol, or name. For symbols provide the $ symbol (e.g., $SOL, $JUP, $BONK)'
      ),
  });

  const getTokenDataTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.getTokenData' as const,
    description:
      'Get details such as the price, market cap, liquidity, price change, holders, volume of buy and sell, amount of holders, top holders and much more',
    parameters: Parameters,
    execute: async (params) => {
      const { token_address } = params;
      console.log(token_address);
      try {
        // Determine if input is an address or symbol
        const isAddress = token_address.length > 35;
        console.log(isAddress);
        console.log('entering the search');
        const url = isAddress
          ? `data/token/address?token_address=${token_address}`
          : `data/token/symbol?symbol=${token_address}`;

        // Fetch token data
        if (!context.authToken) {
          return {
            success: false,
            error: 'No auth token provided',
            data: undefined,
          };
        }
        const apiClient = createServerApiClient(context.authToken);
        const response = await apiClient.get<TokenDataResponse>(
          url,
          undefined,
          'data'
        );
        // Check if response is valid
        if (ApiClient.isApiResponse<TokenDataResponse>(response)) {
          return {
            success: true,
            data: response.data,
            textResponse: false,
          };
        }
        // Handle invalid response
        return {
          success: false,
          error: response.errors[0].detail,
          data: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to fetch token data',
          data: undefined,
        };
      }
    },
  };
  return getTokenDataTool;
};
