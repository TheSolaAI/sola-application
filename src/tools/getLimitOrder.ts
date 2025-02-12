import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { Tool } from '../types/tool.ts';
import { ShowLimitOrderParams} from '../types/jupiter.ts';
import { getLimitOrderHandler } from '../lib/solana/limitOrderTx.ts';

const functionDescription =
  'Call this function when the user wants view their open limit orders.';

export const getLimitOrders: Tool = {
  implementation: getLimitOrderFunction,
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

async function getLimitOrderFunction(args: {currentWallet:ConnectedSolanaWallet}
): Promise<string> {
  let wallet = args.currentWallet;
  let params: ShowLimitOrderParams = {
    public_key:wallet.address
  }
  let resp = await getLimitOrderHandler(params)
  if (!resp) {
    return 'error fetching data';
  }
  console.log(resp.orders);
  return `limit orders are ${resp.orders}`;

}
