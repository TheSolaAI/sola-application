'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { NFTCollectionCard } from '@/types/messageCard';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { NFTCollectionMessageItem } from '@/components/messages/NFTCollectionCardItem';
import { ToolResult } from '@/types/tool';

// Implementation function with response_id parameter
async function getNFTPriceFunction(
  args: { nft_name: string },
  response_id: string
): Promise<ToolResult<'nft_collection_data'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `NFT Analyst agent: Fetching NFT data...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  const symbol = args.nft_name;
  const response = await apiClient.get<NFTCollectionCard>(
    '/data/nft/symbol?nft_symbol=' + symbol.toLowerCase(),
    undefined,
    'data'
  );

  if (ApiClient.isApiResponse<NFTCollectionCard>(response)) {
    return {
      status: 'success',
      response: `Collection Symbol: ${response.data.symbol}, Floor Price: ${response.data.floor_price}, All time volume: ${response.data.volume_all}, Avg Floor in past 24H ${response.data.avg_price_24hr}, Listed NFTS: ${response.data.listed_count}`,
      props: {
        data: response.data,
        response_id: response_id,
        sender: 'system',
        type: 'nft_collection_data',
      },
    };
  } else {
    return {
      status: 'error',
      response: 'Error fetching NFT collection data',
    };
  }
}

// Register the tool using the registry
export const getNFTPrice = registerTool({
  name: 'getNFTPrice',
  description:
    'Get floor price, volume, and marketplace data for NFT collections on Solana. Use this function when users ask about NFT prices, collection stats, floor prices, or trading activity for any Solana NFT collection.',
  propsType: 'nft_collection_data',
  cost: 0.00001,
  implementation: getNFTPriceFunction,
  component: NFTCollectionMessageItem,
  customParameters: {
    type: 'object',
    properties: {
      nft_name: {
        type: 'string',
        description:
          'The name or symbol of the NFT collection (e.g., "DeGods", "SMB", "Okay Bears")',
      },
    },
    required: ['nft_name'],
  },
});
