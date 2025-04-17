import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';

export function createBubblemapTool(context: ToolContext) {
  const Parameters = z.object({
    token_address: z
      .string()
      .describe(
        'The token address (contract address) to visualize in the Bubblemap. Must be a valid Solana SPL token address.'
      ),
  });

  const bubblemapTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.bubblemap' as const,
    description:
      'Create a Bubblemap visualization for a specific token on the Solana blockchain. Bubblemaps show token ownership distribution, helping identify whale accounts, token concentration, and potential wash trading patterns.',
    parameters: Parameters,
    execute: async (params) => {
      try {
        // Validate token address
        if (!params.token_address || params.token_address.trim().length < 32) {
          return {
            success: false,
            error:
              'Please provide a valid Solana token address for the Bubblemap visualization.',
            data: undefined,
          };
        }

        // Clean up the token address (remove any $ prefix if present)
        const tokenAddress = params.token_address.startsWith('$')
          ? params.token_address.substring(1)
          : params.token_address;

        return {
          success: true,
          data: {
            type: 'bubble_map',
            details: {
              token: tokenAddress,
            },
            response_id: 'temp',
            sender: 'system',
            timestamp: new Date().toISOString(),
          },
          error: undefined,
        };
      } catch (error) {
        console.error('Error generating Bubblemap:', error);
        return {
          success: false,
          error:
            'Failed to create Bubblemap visualization. Please check the token address and try again.',
          data: undefined,
        };
      }
    },
  };

  return bubblemapTool;
}
