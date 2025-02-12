import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { getAssetsLulo } from "../lib/solana/lulo";
import { AssetsParams } from "../types/lulo";

const functionDescription =
  'Call this function when the user wants view their Lulo assets.';

export const getLuloAssets = {
  type: 'function',
  name: 'getLuloAssets',
  description: functionDescription,
  parameters: {
    type: 'object',
    properties: {},
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export async function getLuloAssetsFunction(args: {
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<string> {
  let wallet = args.currentWallet;
  if (!wallet) return Promise.resolve('User wallet is not connected.');
  const params: AssetsParams = {
    owner: `${wallet.address}`,
  };
  const response =await getAssetsLulo(params);
  if (!response) return Promise.resolve('Error getting assets');

  return Promise.resolve(JSON.stringify(response));

}
