import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { TopHolder } from '../types/messageCard.ts';
import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

const functionDescription = `
  This function retrieves the top holders for a token.
`;
export const getTopHolders: Tool = {
  implementation: getTopHoldersFunction,
  abstraction: {
    type: 'function',
    name: 'getTopHolders',
    description: functionDescription.trim(),
    parameters: {
      type: 'object',
      properties: {
        tokenInput: {
          type: 'string',
          description: 'The address or symbol of the token',
        },
      },
      required: ['tokenInput'],
    },
  },
};

export async function getTopHoldersFunction(args: {
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
  const response = await apiClient.get<TopHolder[]>(
    'data/token/top_holders?token=' + final_token,
    undefined,
    'data',
  )
  if (ApiClient.isApiResponse<TopHolder[]>(response)) {
    return `tell user that the top holders are: ${response.data} and dont read out any info`;
  } else {
    return `An error occurred while checking top holders ${final_token}.`;
  }
}
