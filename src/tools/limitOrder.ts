import { Connection, VersionedTransaction } from '@solana/web3.js';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { LimitOrderParams, LimitOrderResponse } from '../types/jupiter.ts';
import { Tool } from '../types/tool.ts';
import { tokenList } from '../config/tokens/tokenMapping.ts';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';



const rpc = process.env.SOLANA_RPC;


const functionDescription =
  'Creates a limit order to buy or sell a token at a specified price.';

export const limitOrder: Tool = {
  implementation: createLimitOrder,
  abstraction: {
    type: 'function',
    name: 'limitOrder',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['BUY', 'SELL'],
          description: 'Order action: either "BUY" or "SELL".',
        },
        amount: {
          type: 'number',
          description: 'The amount of token that the user wants to buy or sell',
        },
        token: {
          type: 'string',
          description: 'The token that the user wants to buy or sell',
        },
        limitPrice: {
          type: 'number',
          description:
            'The limit price specified by the user in usd or dollars',
        },
      },
      required: ['action', 'amount', 'token', 'limitPrice'],
    },
  },
};

export async function createLimitOrder(args: {
  amount: number;
  token: 'SOL' | 'SOLA' | 'USDC' | 'BONK' | 'USDT' | 'JUP' | 'WIF';
  action: 'BUY' | 'SELL';
  limitPrice: number;
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<string> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      text: `Creating a limit order to ${args.action.toLowerCase()} ${args.amount} ${args.token} at $${args.limitPrice}...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });
  
  let currentWallet = args.currentWallet;
  if (!currentWallet) return 'User wallet is not connected.';
  if (!rpc) return 'Please contact admin, as RPC is not attached.';

  const params: LimitOrderParams = {
    token_mint_a: tokenList[args.token].MINT,
    token_mint_b: tokenList['USDC'].MINT,
    public_key: `${currentWallet.address}`,
    amount: args.amount,
    limit_price: args.limitPrice,
    action: args.action,
  };

  const connection = new Connection(rpc);
  try {
    const resp = await apiClient.post<LimitOrderResponse>(
      'api/wallet/jup/limit-order/create',
      params,
      'wallet'
    );
    if (ApiClient.isApiResponse<LimitOrderResponse>(resp)) {
      const transaction = resp.data.tx;
      if (!transaction) {
        return 'The limit order creation failed. Please try again later.';
      }
  
      const transactionBuffer = Buffer.from(transaction, 'base64');
      const final_tx = VersionedTransaction.deserialize(transactionBuffer);
      const signedTransaction = await currentWallet.signTransaction(final_tx);
      const rawTransaction = signedTransaction.serialize();
  
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 10,
      });
  
      return `Limit order has been created successfully. Transaction ID: ${txid}`;
    } else {
      return 'The limit order creation failed. Please try again later.';
    }
  
  }
  catch (error) {
    console.error('Error creating limit order:', error);
    return 'The limit order creation failed. Please try again later.';
  }
}
