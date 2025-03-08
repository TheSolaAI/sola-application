import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { getAssetsLulo } from '../lib/solana/lulo';
import { AssetsParams } from '../types/lulo';
import { LuloChatContent } from '../types/chatItem';
import { Tool } from '../types/tool';
import { LuloChatItem } from '../components/messages/LuloMessageItem.tsx';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

const functionDescription =
  'Call this function when the user wants view their assets, Earnings, Deposit, stats in Lulo platform.';

export const getLuloAssets: Tool = {
  cost: 0.00001,
  implementation: getLuloAssetsFunction,
  representation: {
    props_type: 'user_assets_lulo',
    component: LuloChatItem,
  },
  abstraction: {
    type: 'function',
    name: 'getLuloAssets',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

export async function getLuloAssetsFunction(args: {
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: LuloChatContent;
}> {
  let wallet = args.currentWallet;
  if (!wallet) {
    return {
      status: 'error',
      response:
        'Ask user to connect wallet first, Before trying to get the assets.',
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
      response: 'Error getting assets',
    };
  }

  let data: LuloChatContent = {
    response_id: 'temp',
    sender: 'system',
    type: 'user_lulo_data',
    data: response,
  };
  return {
    status: 'success',
    response: `User Lulo Stats, Deposit Value: ${response.depositValue}, Interest Earned: ${response.interestEarned} `,
    props: data,
  };
}
