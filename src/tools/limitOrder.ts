import { Connection, VersionedTransaction } from '@solana/web3.js';
import { ApiClient } from '../api/ApiClient.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { LimitOrderParams, LimitOrderResponse } from '../types/jupiter.ts';
import { Tool } from '../types/tool.ts';
import { tokenList } from '../config/tokens/tokenMapping.ts';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { limitOrderTx } from '../lib/solana/limitOrderTx.ts';
import { TransactionChatContent } from '../types/chatItem.ts';
import { TransactionDataMessageItem } from '../components/ui/message_items/TransactionCard.tsx';

const rpc = import.meta.env.VITE_SOLANA_RPC;

const functionDescription =
  'Creates a limit order to buy or sell a specified token at a user-defined price in USD.';

export const limitOrder: Tool = {
  implementation: createLimitOrder,
  representation: {
    props_type: 'transaction_message',
    component: TransactionDataMessageItem,
  },

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
          enum: ['SOL', 'SOLA', 'USDC', 'BONK', 'USDT', 'JUP', 'WIF'],
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
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: TransactionChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Token Analysis agent: Creating limit order to ${args.action.toLowerCase()} ${args.amount} ${args.token} at $${args.limitPrice}...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  let currentWallet = args.currentWallet;
  if (!currentWallet) {
    return {
      status: 'error',
      response: 'Please connect your wallet first.',
    };
  }
  if (!rpc) {
    return {
      status: 'error',
      response: 'Please set your SOLANA_RPC environment variable.',
    };
  }

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
    const resp = await limitOrderTx(params);
    if (ApiClient.isApiResponse<LimitOrderResponse>(resp)) {
      const transaction = resp.data.tx;
      if (!transaction) {
        return {
          status: 'error',
          response: 'error during transaction',
        };
      }

      const transactionBuffer = Buffer.from(transaction, 'base64');
      const final_tx = VersionedTransaction.deserialize(transactionBuffer);
      const signedTransaction = await currentWallet.signTransaction(final_tx);
      const rawTransaction = signedTransaction.serialize();

      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 10,
      });

      return {
        status: 'success',
        response: 'Limit order created successfully',
        props: {
          response_id: 'temp',
          sender: 'system',
          type: 'transaction_message',
          data: {
            title: resp.data.order,
            status: 'success',
            link: txid,
          },
        },
      };
    } else {
      return {
        status: 'error',
        response: 'error during transaction',
      };
    }
  } catch (error) {
    console.error('Error creating limit order:', error);
    return {
      status: 'error',
      response: 'error during transaction',
    };
  }
}
