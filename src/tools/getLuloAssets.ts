import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { getAssetsLulo } from "../lib/solana/lulo";
import { AssetsParams } from "../types/lulo";
import { LuloChatContent } from "../types/chatItem";
import { Tool } from "../types/tool";

const functionDescription =
  'Call this function when the user wants view their Lulo assets.';

export const getLuloAssets:Tool = {
  implementation: getLuloAssetsFunction,
  representation: {
    props_type: 'user_assets_lulo',
    component: UserAssetsLuloMessageItem,
  },
  abstraction: {
    type: 'function',
    name: 'getLuloAssets',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {},
    },
  }
};

//TODO: Shift the trigger logic here from conversation.tsx
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
      response: 'no wallet connected',
    };
  }
  const params: AssetsParams = {
    owner: `${wallet.address}`,
  };
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
  }
  return {
    status: 'success',
    response: 'success',
    props: data,
  };

  

}
