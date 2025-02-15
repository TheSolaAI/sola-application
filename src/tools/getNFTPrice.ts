import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { NFTPriceChatContent } from "../types/chatItem";
import { Tool } from "../types/tool";
import { useChatMessageHandler } from "../models/ChatMessageHandler";
import { NFTCard } from "../types/messageCard";
import { ApiClient, apiClient } from "../api/ApiClient";


const functionDescription =
  'To get the price of on an NFT. NOTE: The user must specify the word NFT';

export const getNFTPrice: Tool = {
  implementation: getNFTPriceFunction,
  representation: {
    props_type: 'nft_price',
    component: NFTPriceMessageItem,
  },
  abstraction: {
    type: 'function',
    name: 'getNFTPrice',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        nft_name: {
          type: 'string',
          description: 'the name of the nft',
        },
      },
      required: ['nft_name'],
    },
  }
};

export async function getNFTPriceFunction(
  args: {
    nft_name: string;
    currentWallet: ConnectedSolanaWallet | null;
  }
): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: NFTPriceChatContent;
}> {
useChatMessageHandler.getState().setCurrentChatItem({
  content: {
    type: 'simple_message',
    text: `Fetching ${args.nft_name} details...`,
    response_id: 'temp',
    sender: 'system',
  },
  id: 0,
  createdAt: new Date().toISOString(),
});
  
  const symbol = args.nft_name
  let response = await apiClient.get<NFTCard>(
    '/data/nft/symbol?nft_symbol=' + symbol,
    undefined,
    'data',
  );
  if (ApiClient.isApiResponse<NFTCard>(response)) {
    return {
      status: 'success',
      response: 'success',
      props: {
        data: response.data,
        response_id: 'temp',
        sender: 'system',
        type: 'nft_price',
      }
    };
  } else {
    return {
      status: 'error',
      response: 'error',
    };
  }



}
  
