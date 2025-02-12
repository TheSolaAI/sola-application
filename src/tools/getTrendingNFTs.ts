import { ApiClient, apiClient } from "../api/ApiClient";
import { useChatMessageHandler } from "../models/ChatMessageHandler";
import { TrendingNFTCard } from '../types/messageCard';

const functionDescription =
  'Call this function when the user wants to get the trending solana nfts.';

export const getTrendingNFTs = {
  type: 'function',
  name: 'getTrendingNFTs',
  description: functionDescription,
  parameters: {
    type: 'object',
    properties: {},
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export async function getTrendingNFTsFunction() {
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
  let response = await apiClient.get<TrendingNFTCard[]>('/data/nft/top_nft', undefined, 'data');
  if (ApiClient.isApiResponse<TrendingNFTCard[]>(response)) {
    return `trending NFTs: ${response.data.map((nft) => nft.name).join(', ')}`;
  } else {
    return `An error occurred while fetching trending NFTs. Please try again later.`;
  }
}
