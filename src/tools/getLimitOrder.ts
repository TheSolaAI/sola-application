import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { Tool } from '../types/tool.ts';
import { ShowLimitOrderParams } from '../types/jupiter.ts';
import { getLimitOrderHandler } from '../lib/solana/limitOrderTx.ts';
import { ShowLimitOrdersChatContent } from '../types/chatItem.ts';
import { ShowLimitOrdersChatItem } from '../components/ui/message_items/ShowLimitOrderChatItem.tsx';

const functionDescription =
  'Call this function when the user wants view their open limit orders.';

export const getLimitOrders: Tool = {
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
  let wallet = args.currentWallet;
  if (!wallet) {
    return {
      status: 'error',
      response: 'No wallet connected',
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

  return {
    status: 'success',
    response: 'Success',
    props: data,
  };
}
