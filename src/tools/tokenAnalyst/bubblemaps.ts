'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { BubbleMapChatItem } from '@/components/messages/BubbleMapCardItem';
import { ToolResult } from '@/types/tool';

/**
 * Implementation function for the getBubblemap tool
 * Creates a bubblemap visualization for a token address
 */
async function getBubblemapFunction(
  args: { token_address: string },
  response_id: string
): Promise<ToolResult<'bubble_map'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Token Analyst: Generating Bubblemap visualization...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    // Validate token address
    if (!args.token_address || args.token_address.trim().length < 32) {
      return {
        status: 'error',
        response:
          'Please provide a valid Solana token address for the Bubblemap visualization.',
      };
    }

    // Clean up the token address (remove any $ prefix if present)
    const tokenAddress = args.token_address.startsWith('$')
      ? args.token_address.substring(1)
      : args.token_address;

    return {
      status: 'success',
      response: `Ask user if they need anything else`,
      props: {
        response_id,
        sender: 'system',
        type: 'bubble_map',
        data: {
          token: tokenAddress,
        },
      },
    };
  } catch (error) {
    console.error('Error generating Bubblemap:', error);
    return {
      status: 'error',
      response:
        'Failed to create Bubblemap visualization. Please check the token address and try again.',
    };
  }
}

// Register the tool using the registry
export const bubblemap = registerTool({
  name: 'Bubblemap',
  description:
    'Create a Bubblemap visualization for a specific token on the Solana blockchain. Bubblemaps show token ownership distribution, helping identify whale accounts, token concentration, and potential wash trading patterns.',
  propsType: 'bubble_map',
  cost: 0.00001,
  implementation: getBubblemapFunction,
  component: BubbleMapChatItem,
  customParameters: {
    type: 'object',
    properties: {
      token_address: {
        type: 'string',
        description:
          'The token address (contract address) to visualize in the Bubblemap. Must be a valid Solana SPL token address.',
      },
    },
    required: ['token_address'],
  },
});
