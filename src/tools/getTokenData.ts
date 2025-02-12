import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { TokenDataResponse } from '../types/response.ts';
<<<<<<< HEAD
import { formatNumber } from '../utils/formatNumber.ts';
=======
import { TokenDataMessageItem } from '../components/ui/message_items/TokenDataMessageItem.tsx';
import { TokenDataChatContent } from '../types/chatItem.ts';
>>>>>>> 139bfa0e1b90a1878b9893972d895b1a5667ecda

const functionDescription = `Use this function to get the details or price of a token. NOTE: The user must specify the word Token. If the token address contains the sequence pump, do not remove it, it is part of the token.`;

export const getTokenData: Tool = {
  implementation: getTokenDataFunction,
  representation: {
    props_type: 'token_data',
    component: TokenDataMessageItem,
  },
  abstraction: {
    type: 'function',
    name: 'getTokenData',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description: 'The token address or token symbol.',
        },
      },
      required: ['token'],
    },
  },
};

async function getTokenDataFunction(
  args: { token_address: string },
  response_id: string,
): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: TokenDataChatContent;
}> {
  // Add temporary message
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      text: 'Fetching token data...',
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

<<<<<<< HEAD
  if (args.token_address.length > 35) {
    // this is a token address
    const response = await apiClient.get<TokenDataResponse>(
      '/data/token/address?token_address=' + args.token_address,
      undefined,
      'data',
    );
    if (ApiClient.isApiResponse<TokenDataResponse>(response)) {
      return `Tell the user that the token ${response.data.metadata.name} has a price of $${response.data.price} and a market cap of $${formatNumber(response.data.marketcap)} at this moment while converting all numbers to proper American English from their scientific notations.
      Only specify the price if if its reasonable to do so.`;
    } else {
      return 'An error occurred while fetching token data';
    }
  } else {
    
    const response = await apiClient.get<TokenDataResponse>(
      '/data/token/symbol?symbol=' + args.token_address,
      undefined,
      'data',
    );
    if (ApiClient.isApiResponse<TokenDataResponse>(response)) {
      return `The token ${response.data.metadata.name} has a price of $${response.data.price} and a market cap of $${response.data.price} at this moment.
      The price has changed by ${response.data.price_change_24}% in the last 24 hours.`;
    } else {
      return 'An error occurred while fetching token data';
    }
=======
  const isAddress = args.token_address.length > 35;
  const url = isAddress
    ? '/data/token/address?token_address=' + args.token_address
    : '/data/token/symbol?symbol=' + args.token_address;

  // Fetch token data
  const response = await apiClient.get<TokenDataResponse>(
    url,
    undefined,
    'data',
  );

  if (ApiClient.isApiResponse<TokenDataResponse>(response)) {
    // Construct UI props
    const uiProps: TokenDataChatContent = {
      response_id,
      sender: 'assistant',
      type: 'token_data',
      name: response.data.metadata.name,
      symbol: response.data.metadata.symbol,
      price: response.data.price,
      marketCap: response.data.marketcap,
      image: response.data.image,
    };

    // Construct response message
    const responseMessage = isAddress
      ? `Tell the user that the token ${response.data.metadata.name} has a price of $${response.data.price} and a market cap of $${response.data.marketcap} at this moment while converting all numbers to proper American English from their scientific notations. Only specify the price if it's reasonable to do so.`
      : `The token ${response.data.metadata.name} has a price of $${response.data.price} and a market cap of $${response.data.marketcap} at this moment. The price has changed by ${response.data.price_change_24}% in the last 24 hours.`;

    return {
      status: 'success',
      response: responseMessage,
      props: uiProps,
    };
  } else {
    return {
      status: 'error',
      response: 'An error occurred while fetching token data',
    };
>>>>>>> 139bfa0e1b90a1878b9893972d895b1a5667ecda
  }
}
