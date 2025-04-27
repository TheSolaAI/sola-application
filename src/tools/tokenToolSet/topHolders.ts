import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { getTopHoldersHandler } from '@/lib/solana/topHolders';

export function createTopHoldersTool(context: ToolContext) {
  const Parameters = z.object({
    token_address: z
      .string()
      .describe(
        'The token address (contract address) to get top holders for. Must be a valid Solana SPL token address.'
      ),
  });

  const topHoldersTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.topHolders' as const,
    description:
      'Get the top holders for a specific token on the Solana blockchain. Use this to analyze token distribution, whale concentration, and insider holdings.',
    parameters: Parameters,
    execute: async (params) => {
      try {
        console.log('Top holders tool executed with params:', params);

        if (!context.authToken) {
          return {
            success: false,
            error: 'No auth token provided',
            data: undefined,
          };
        }

        const topHolders = await getTopHoldersHandler(
          params.token_address,
          context.authToken
        );

        if (!topHolders) {
          return {
            success: false,
            error:
              'Failed to fetch top holders information. Please check the token address and try again.',
            data: undefined,
          };
        }

        return {
          success: true,
          data: {
            details: topHolders,
          },
          error: undefined,
          textResponse: false,
        };
      } catch (error) {
        console.error('Error getting top holders:', error);
        return {
          success: false,
          error:
            'Error getting top holders information. The token may not exist or there might be a network issue.',
          data: undefined,
        };
      }
    },
  };

  return topHoldersTool;
}
