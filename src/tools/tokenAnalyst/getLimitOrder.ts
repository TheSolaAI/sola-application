'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { getLimitOrderHandler } from '@/lib/solana/limitOrderTx';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ShowLimitOrdersChatItem } from '@/components/messages/ShowLimitOrderChatItem';
import { useWalletHandler } from '@/store/WalletHandler';
import { ToolResult } from '@/types/tool';

export const getLimitOrders = registerTool({
  name: 'getLimitOrders',
  description: 'Get the active limit orders of the user.',
  propsType: 'get_limit_order',
  cost: 0.00001,
  implementation: getLimitOrderFunction,
  component: ShowLimitOrdersChatItem,
  customParameters: {
    type: 'object',
    properties: {},
  },
});

async function getLimitOrderFunction(
  _args: Record<string, never>,
  response_id: string
): Promise<ToolResult<'get_limit_order'>> {
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

  // Get the current wallet from the WalletHandler store
  const wallet = useWalletHandler.getState().currentWallet;

  if (!wallet) {
    return {
      status: 'error',
      response: 'No wallet connected, connect wallet to get the limit orders.',
    };
  }

  const params = {
    public_key: wallet.address,
  };

  const resp = await getLimitOrderHandler(params);

  if (!resp) {
    return {
      status: 'error',
      response: 'Error fetching limit orders',
    };
  }

  const orderIds: string[] = [];
  resp.orders.forEach((element) => {
    orderIds.push(element.order_id);
  });

  return {
    status: 'success',
    response: `tell them they have ${resp.orders.length} active limit orders.`,
    props: {
      response_id,
      sender: 'system',
      type: 'get_limit_order',
      data: resp,
    },
  };
}
