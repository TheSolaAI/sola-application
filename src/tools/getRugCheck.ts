import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { RugCheckCard } from '../types/messageCard.ts';
import { Tool } from '../types/tool.ts';

const functionDescription =
  'Use this function to check if the token is rug or a scam or to analyse its risk factors.';

export const getRugCheck: Tool = {
  implementation: getRugCheckFunction,
  abstraction: {
    type: 'function',
    name: 'getRugCheck',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'The name or address of the token',
        },
      },
      required: ['token'],
    },
  },
};

export async function getRugCheckFunction(args: {
  token_address: string;
}): Promise<string> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      text: `Checking if ${args.token_address} is a rug...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });
  let token = args.token_address;
  let final_token = '';
    console.log(token.length);
    if (token.length > 35 || token.startsWith('$')) {
      final_token = token;
    } else {
      final_token = `$${token}`;
    }
  const response = await apiClient.get<RugCheckCard>(
    'data/token/rug_check?token=' + final_token,
    undefined,
    'data',
  )
  if (ApiClient.isApiResponse<RugCheckCard>(response)) {
      return `tell user that score: ${response.data.score} and issues are ${response.data.issues}`;
    } else {
      return 'An error occurred while checking if ${token} is a rug.';
    }
}



