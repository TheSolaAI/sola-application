'use client';
import { registerTool } from '@/lib/registry/toolRegistry';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { TrendingNFTCard } from '@/types/messageCard';
import { GetTrendingNFTSChatContent } from '@/types/chatItem';
import { TrendingNFTMessageItem } from '@/components/messages/TrendingNFTMessageItem';
import { ToolResult } from '@/types/tool';

async function getTrendingNFTsFunction(
  _args: Record<string, never>,
  response_id: string
): Promise<ToolResult<'get_trending_nfts'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `NFT Analyst: Fetching trending NFTs...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  const response = await apiClient.get<TrendingNFTCard[]>(
    '/data/nft/top_nft',
    undefined,
    'data'
  );

  if (ApiClient.isApiResponse<TrendingNFTCard[]>(response)) {
    return {
      status: 'success',
      response: `Trending NFTs, ${response.data.map((nft) => nft.name).join(', ')}`,
      props: {
        data: response.data,
        response_id: response_id,
        sender: 'system',
        type: 'get_trending_nfts',
      },
    };
  } else {
    return {
      status: 'error',
      response: 'Error fetching trending NFTs',
    };
  }
}

// Register the tool using the registry
export const getTrendingNFTs = registerTool({
  name: 'getTrendingNFTs',
  description:
    'Call this function when the user wants to get the trending Solana NFTs.',
  propsType: 'get_trending_nfts',
  cost: 0.00001,
  implementation: getTrendingNFTsFunction,
  component: TrendingNFTMessageItem,
  customParameters: {
    type: 'object',
    properties: {}, // Empty properties since this tool takes no parameters
  },
});
