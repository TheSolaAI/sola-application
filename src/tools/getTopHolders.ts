import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { TopHolder } from '../types/messageCard.ts';
import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { getTopHoldersHandler } from '../lib/solana/topHolders.ts';

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
  tokenInput
  : string;
}): Promise<string> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      text: `Analyzing ${args.tokenInput} for top holders...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });
  let token= args.tokenInput;
  let final_token = '';
  console.log(token.length);
  if (token.length > 35 || token.startsWith('$')) {
    final_token = token;
  } else {
    final_token = `$${token}`;
  }
  const response = await getTopHoldersHandler(final_token);
  if (!response) {
    return `An error occurred while checking top holders ${final_token}.`;
  }
  console.log(response);
  return `tell user that the top holders are: ${response} and dont read out any info`

}
