'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { getTopHoldersHandler } from '@/lib/solana/topHolders';
import { TopHoldersMessageItem } from '@/components/messages/TopHoldersMessageItem';
import { ToolResult } from '@/types/tool';

/**
 * Implementation function for the TopHolders tool
 * Fetches top token holders data and formats it for display
 */
async function getTopHoldersFunction(
  args: { token_address: string },
  response_id: string
): Promise<ToolResult<'top_holders'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Token Analyst: Fetching top holders...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    const topHolders = await getTopHoldersHandler(args.token_address);

    if (!topHolders) {
      return {
        status: 'error',
        response:
          'Failed to fetch top holders information. Please check the token address and try again.',
      };
    }

    return {
      status: 'success',
      response: `Ask if the user needs anything else`,
      props: {
        response_id,
        sender: 'system',
        type: 'top_holders',
        data: topHolders,
      },
    };
  } catch (error) {
    console.error('Error getting top holders:', error);
    return {
      status: 'error',
      response:
        'Error getting top holders information. The token may not exist or there might be a network issue.',
    };
  }
}

// Register the tool using the registry
export const topHolders = registerTool({
  name: 'TopHolders',
  description:
    'Get the top holders for a specific token on the Solana blockchain. Use this to analyze token distribution, whale concentration, and insider holdings.',
  propsType: 'top_holders',
  cost: 0.00001,
  implementation: getTopHoldersFunction,
  component: TopHoldersMessageItem,
  customParameters: {
    type: 'object',
    properties: {
      token_address: {
        type: 'string',
        description:
          'The token address (contract address) to get top holders for. Must be a valid Solana SPL token address.',
      },
    },
    required: ['token_address'],
  },
});
