import { z } from 'zod';
import { registerTool } from '@/lib/registry/toolRegistry';
import { tokenDataSchema } from '@/lib/schemas/tokenDataSchema';
import { TokenDataMessageItem } from '@/components/messages/TokenDataMessageItem';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { TokenDataResponse } from '@/types/response';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ToolResult } from '@/types/tool';
import { TokenDataChatContent } from '@/types/chatItem';

// Implementation with schema validation
const getTokenDataImplementation = async (
  args: z.infer<typeof tokenDataSchema>,
  response_id: string
): Promise<ToolResult<'token_data'>> => {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Token Analyst: Fetching token data...`,
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

  try {
    const response = await apiClient.get<TokenDataResponse>(
      url,
      undefined,
      'data'
    );

    if (ApiClient.isApiResponse<TokenDataResponse>(response)) {
      return {
        status: 'success',
        response: `Token data fetched: ${response.data.name} (${response.data.symbol}): $${response.data.price}`,
        props: {
          type: 'token_data',
          data: response.data,
          response_id,
          sender: 'system',
        } as TokenDataChatContent, // Use type assertion to satisfy TypeScript
      };
    } else {
      return {
        status: 'error',
        response: 'Failed to fetch token data',
        // No props for error case
      };
    }
  } catch (error) {
    console.error('Error getting token data:', error);
    return {
      status: 'error',
      response: 'Error getting token data',
    };
  }
};

// Register the tool using the registry
export const getTokenData = registerTool(
  'getTokenData',
  'Get the current price of any token in Solana Blockchain, including detailed information.',
  tokenDataSchema,
  'token_data',
  0.00001,
  getTokenDataImplementation,
  TokenDataMessageItem
);
