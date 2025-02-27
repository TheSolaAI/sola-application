import { ApiClient, apiClient } from '../../api/ApiClient.ts';
import { useChatMessageHandler } from '../../models/ChatMessageHandler.ts';
import { TrendingNFTCard } from '../../types/messageCard.ts';
import { Tool } from '../../types/tool.ts';
import { GetTrendingNFTSChatContent } from '../../types/chatItem.ts';
import { TrendingNFTMessageItem } from '../../components/ui/message_items/TrendingNFTMessageItem.tsx';

const functionDescription =
  'Call this function when the user wants to get the trending solana nfts.';

export const getTrendingNFTs: Tool = {
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
  let response = await apiClient.get<TrendingNFTCard[]>(
    '/data/nft/top_nft',
    undefined,
    'data',
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
