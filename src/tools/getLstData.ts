import { getLstDataHandler } from '../lib/solana/lst_data.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { Tool } from '../types/tool.ts';

const functionDescription =
  'Call this function when the user wants to know the highest apy in LST (Liquid Staking Token). General questions would be what is the best lst to stake? etc';

export const getLstData: Tool = {
  implementation: getLstDataFunction,
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

//TODO: Shift the trigger logic here from conversation.tsx
export async function getLstDataFunction() {
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
    return 'error fetching data';
  }
  console.log(response)
  return `${response} is the lst data`

}
