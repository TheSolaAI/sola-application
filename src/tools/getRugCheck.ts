import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { RugCheckChatContent } from '../types/chatItem.ts';
import { RugCheckCard } from '../types/messageCard.ts';
import { Tool } from '../types/tool.ts';
import { RugCheckChatItem } from '../components/ui/message_items/RugCheckMessageItem.tsx';

const functionDescription =
  'Use this function to check if the token is rug or a scam or to analyse its risk factors.';

export const getRugCheck: Tool = {
  implementation: getRugCheckFunction,
  representation: {
    props_type: 'rug_check',
    component: RugCheckChatItem,
  },
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

export async function getRugCheckFunction(args: { token: string }): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: RugCheckChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Checking if ${args.token} is a rug...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });
  console.log(args);
  let token = args.token;
  let final_token = '';
  if (token.length > 35 || token.startsWith('$')) {
    final_token = token;
  } else {
    final_token = `$${token}`;
  }
  const response = await apiClient.get<RugCheckCard>(
    '/data/token/rug_check?token_address=' + final_token,
    undefined,
    'data',
  );
  console.log('im sending the ressponse');
  if (ApiClient.isApiResponse<RugCheckCard>(response)) {
    console.log(response.data);
    return {
      status: 'success',
      response: 'Rug check successful.',
      props: {
        type: 'rug_check',
        sender: 'system',
        response_id: 'temp',
        data: {
          score: response.data.score,
          issues: response.data.issues,
        },
      },
    };
  } else {
    return {
      status: 'error',
      response: 'An error occurred while checking rug check.',
    };
  }
}
