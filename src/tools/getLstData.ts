import { getLstDataHandler } from '../lib/solana/lst_data.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { ShowLSTDataChatContent } from '../types/chatItem.ts';
import { Tool } from '../types/tool.ts';
import { ShowLSTDataChatItem } from '../components/ui/message_items/LSTCardItem.tsx';

const functionDescription =
  'Call this function when the user wants to know the highest apy in LST (Liquid Staking Token). General questions would be what is the best lst to stake? etc';

export const getLstData: Tool = {
  implementation: getLstDataFunction,
  representation: {
    props_type: 'get_lst_data',
    component: ShowLSTDataChatItem,
  },
  abstraction: {
    type: 'function',
    name: 'getLstData',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

export async function getLstDataFunction(): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: ShowLSTDataChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      text: `Fetching LST data...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });
  let response = await getLstDataHandler();
  if (!response) {
    return {
      status: 'error',
      response: 'Error fetching lst data',
    };
  }

  return {
    status: 'success',
    response: 'LST data fetched successfully',
    props: {
      response_id: 'temp',
      sender: 'system',
      type: 'get_lst_data',
      data: response,
    },
  };
}
