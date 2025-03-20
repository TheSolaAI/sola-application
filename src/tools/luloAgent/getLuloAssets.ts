'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { getAssetsLulo } from '@/lib/solana/lulo';
import { AssetsParams } from '@/types/lulo';
import { LuloChatItem } from '@/components/messages/LuloMessageItem';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ToolResult } from '@/types/tool';
import { useWalletHandler } from '@/store/WalletHandler';

// Implementation function with response_id parameter
async function getLuloAssetsFunction(
  _args: Record<string, never>,
  response_id: string
): Promise<ToolResult<'user_lulo_data'>> {
  const wallet = useWalletHandler.getState().currentWallet;
  if (!wallet) {
    return {
      status: 'error',
      response:
        'Ask user to connect wallet first, before trying to get the assets.',
    };
  }

  const params: AssetsParams = {
    owner: `${wallet.address}`,
  };

  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Lulo agent: Fetching assets...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  const response = await getAssetsLulo(params);
  if (!response) {
    return {
      status: 'error',
      response: 'Error getting assets from Lulo platform',
    };
  }

  return {
    status: 'success',
    response: `User Lulo Stats, Deposit Value: ${response.depositValue}, Interest Earned: ${response.interestEarned}`,
    props: {
      response_id: response_id,
      sender: 'system',
      type: 'user_lulo_data',
      data: response,
    },
  };
}

// Register the tool using the registry
export const getLuloAssets = registerTool({
  name: 'getLuloAssets',
  description:
    'Call this function when the user wants to view their assets, earnings, deposit, stats in Lulo platform.',
  propsType: 'user_lulo_data',
  cost: 0.00001,
  implementation: getLuloAssetsFunction,
  component: LuloChatItem,
  customParameters: {
    type: 'object',
    properties: {
      currentWallet: {
        type: 'object',
        description: 'The current wallet of the user',
      },
    },
    required: ['currentWallet'],
  },
});
