import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { TokenDataResponse } from '../types/response.ts';
import { TokenDataMessageItem } from '../components/ui/message_items/TokenDataMessageItem.tsx';
import { TokenDataChatContent } from '../types/chatItem.ts';

const functionDescription = `Use this function to get the details like Market Cap or volume or price of a token.`;

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
      data: {
        address: args.token_address,
        image: response.data.image,
        metadata: response.data.metadata,
        volume: response.data.volume.toString(),
        marketCap: response.data.marketcap.toString(),
        price: response.data.price.toString(),
        priceChange: response.data.price_change_24.toString(),
      },
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
  }
}
