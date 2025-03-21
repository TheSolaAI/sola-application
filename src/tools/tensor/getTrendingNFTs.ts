import { ApiClient, apiClient } from '@/lib/ApiClient';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { TrendingNFTCard } from '@/types/messageCard';
import { Tool } from '@/types/tool';
import { GetTrendingNFTSChatContent } from '@/types/chatItem';
import { TrendingNFTMessageItem } from '@/components/messages/TrendingNFTMessageItem';

const functionDescription =
  'Call this function when the user wants to get the trending solana nfts.';

export const getTrendingNFTs: Tool = {
  cost: 0.00001,
  implementation: getTrendingNFTsFunction,
  representation: {
    props_type: 'get_trending_nfts',
    component: TrendingNFTMessageItem,
  },
  abstraction: {
    type: 'function',
    name: 'getTrendingNFTs',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

export async function getTrendingNFTsFunction(): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: GetTrendingNFTSChatContent;
}> {
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
        response_id: 'temp',
        sender: 'system',
        type: 'get_trending_nfts',
      },
    };
  } else {
    return {
      status: 'error',
      response: 'error',
    };
  }
}
