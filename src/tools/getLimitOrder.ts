import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { Tool } from '../types/tool.ts';
import { ShowLimitOrderParams } from '../types/jupiter.ts';
import { getLimitOrderHandler } from '../lib/solana/limitOrderTx.ts';
import { ShowLimitOrdersChatContent } from '../types/chatItem.ts';
import { ShowLimitOrdersChatItem } from '../components/ui/message_items/ShowLimitOrderChatItem.tsx';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

const functionDescription = 'Get the active limit orders of the user.';

export const getLimitOrders: Tool = {
  cost: 0.00001,
  implementation: getLimitOrderFunction,
  representation: {
    props_type: 'show_limit_orders',
    component: ShowLimitOrdersChatItem,
  },
  abstraction: {
    type: 'function',
    name: 'getLimitOrders',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

async function getLimitOrderFunction(args: {
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: ShowLimitOrdersChatContent;
}> {
  console.log("farrah")
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: 'Token Analyst agent: Fetching active limit orders...',
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  let wallet = args.currentWallet;
  if (!wallet) {
    return {
      status: 'error',
      response: 'No wallet connected, connect wallet to get the limit orders.',
    };
  }
  let params: ShowLimitOrderParams = {
    public_key: wallet.address,
  };
  let resp = await getLimitOrderHandler(params);
  if (!resp) {
    return {
      status: 'error',
      response: 'Error fetching limit orders',
    };
  }
  let data: ShowLimitOrdersChatContent = {
    response_id: 'temp',
    sender: 'system',
    type: 'get_limit_order',
    data: resp,
  };
 
  let order_id:String[] = [];
  resp.orders.forEach(element => {
    order_id.push(element.order_id);
  });
  console.log(order_id)
  return {
    status: 'success',
    response: `tell them they have ${resp.orders.length} active limit orders.`,
    props: data,
  };
}
