import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { TokenDataResponse } from '../types/response.ts';
import { TokenDataMessageItem } from '../components/ui/message_items/TokenDataMessageItem.tsx';
import { TokenDataChatContent } from '../types/chatItem.ts';

const functionDescription = `Use this function to get the details like Market Cap or volume or price of a token for a given token symbol or address.`;

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
    : '/data/token/symbol?symbol=$' + args.token_address;

  // Fetch token data
  try {
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
        data: response.data,
      };

      // Construct response message
      const responseMessage = `The token ${response.data.name} has a price of $${response.data.price} and a market cap of $${response.data.marketCap} at this moment. The price has changed by ${response.data.priceChange24hPercent}% in the last 24 hours.`;

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
  } catch (e) {
    console.error('error while fetching token data', e);
    return {
      status: 'error',
      response: 'An error occurred while fetching token data',
    };
  }
}
