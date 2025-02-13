import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { getTopHoldersHandler } from '../lib/solana/topHolders.ts';
import { TopHoldersChatContent } from '../types/chatItem.ts';

const functionDescription = `
  This function retrieves the top holders for a token.
`;
export const getTopHolders: Tool = {
  implementation: getTopHoldersFunction,
  representation: {
    props_type: 'top_holders',
    component: TopHoldersMessageItem,
  },
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
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: TopHoldersChatContent;
}> {
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
    return {
      status: 'error',
      response: 'Error fetching top holders',
    };
  }
  console.log(response);
  return {
    status: 'success',
    response: 'top holders fetched successfully',
    props: {
      type: 'top_holders',
      response_id: 'temp',
      sender: 'system',
      data:response
    },
  }

}
