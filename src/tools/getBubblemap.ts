import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { Tool } from '../types/tool.ts';
import { getTokenDataSymbol } from '../lib/solana/tokenData.ts';
import { BubbleMapChatContent } from '../types/chatItem.ts';
import { BubbleMapChatItem } from '../components/ui/message_items/BubbleMapCardItem.tsx';

const functionDescription = `Fetches a bubblemap for the specified token. Either token symbol or token address is given as input`;

export const getBubblemap: Tool = {
  implementation: getBubblemapFunction,
  representation: {
    props_type: 'bubble_map',
    component: BubbleMapChatItem,
  },
  abstraction: {
    type: 'function',
    name: 'getBubblemap',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'This is the token address or symbol.',
        },
      },
      required: ['token'],
    },
  },
};

export async function getBubblemapFunction(args: { token: string }): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: BubbleMapChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Fetching bubblemaps for ${args.token}...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  let token = args.token;

  if (token.length !== 44) {
    const formattedToken = token.startsWith('$') ? token : `$${token}`;
    const tokenDetails = await getTokenDataSymbol(formattedToken);

    if (!tokenDetails) {
      return {
        status: 'error',
        response: `Token ${formattedToken} not found`,
      };
    }

    token = tokenDetails.metadata.address || 'NaN';
  }

  return {
    status: 'success',
    response: `Here is the bubblemap for ${token}`,
    props: {
      response_id: 'temp',
      sender: 'system',
      type: 'bubble_map',
      data: {
        token: token,
      },
    },
  };
}
