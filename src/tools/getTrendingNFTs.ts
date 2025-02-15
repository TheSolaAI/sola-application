import { ApiClient, apiClient } from '../api/ApiClient';
import { useChatMessageHandler } from '../models/ChatMessageHandler';
import { TrendingNFTCard } from '../types/messageCard';
import { Tool } from '../types/tool';
import { GetTrendingNFTSChatContent } from '../types/chatItem';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { TrendingNFTMessageItem } from '../components/ui/message_items/TrendingNFTMessageItem';

const functionDescription =
  'Call this function when the user wants to get the trending solana nfts.';

export const getTrendingNFTs:Tool = {
  implementation: getTrendingNFTsFunction,
  representation: {
    props_type: 'get_trending_nfts',
    component: TrendingNFTMessageItem,
  },
  abstraction:{
    type: 'function',
    name: 'getTrendingNFTs',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: { },
    },
  }
};

//TODO: Shift the trigger logic here from conversation.tsx
export async function getTrendingNFTsFunction(args: {
  currentWallet: ConnectedSolanaWallet | null;
})
  : Promise<{
  status: 'success' | 'error';
  response: string;
  props?: GetTrendingNFTSChatContent
  }>{
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      text: `Fetching trending NFTs...`,
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
      response: 'success',
      props: {
        data: response.data,
        response_id: 'temp',
        sender: 'system',
        type: 'get_trending_nfts',
      }
    };
  } else {
    return {
      status: 'error',
      response: 'error',
    };
  }
}
