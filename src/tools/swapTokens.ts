import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { Connection } from '@solana/web3.js';
import { SwapParams } from '../types/jupiter';
import { swapTx } from '../lib/solana/swapTx';
import { Tool } from '../types/tool';
import { SwapChatContent } from '../types/chatItem';
import { SwapChatItem } from '../components/messages/SwapMessageItem.tsx';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

const functionDescription =
  'Use this function when the user wants to swap one token for another at market price. The user may specify the amount of tokenA (in tokens or USD) or the amount of tokenB to receive. Do NOT use this for limit orders.';

export const swapTokens: Tool = {
  cost: 0.00005,
  implementation: swapTokensFunction,
  representation: {
    props_type: 'swap',
    component: SwapChatItem,
  },
  abstraction: {
    type: 'function',
    name: 'swapTokens',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        swapType: {
          type: 'string',
          enum: ['EXACT_IN', 'EXACT_OUT', 'EXACT_DOLLAR'],
          description:
            'The type of swap: EXACT_IN specifies the amount of tokenA being swapped, EXACT_OUT specifies the amount of tokenB to receive, and EXACT_DOLLAR specifies the dollar amount to be swapped.',
        },
        quantity: {
          type: 'number',
          description:
            'The amount for the swap. If swapType is EXACT_IN, this is the amount of tokenA. If swapType is EXACT_OUT, this is the amount of tokenB. If swapType is EXACT_DOLLAR, this is the dollar amount to swap.',
        },
        tokenA: {
          type: 'string',
          description: 'The token that the user wants to swap from.',
        },
        tokenB: {
          type: 'string',
          description: 'The token that the user wants to receive.',
        },
      },
      required: ['swapType', 'quantity', 'tokenA', 'tokenB'],
    },
  },
};

export async function swapTokensFunction(args: {
  swapType: 'EXACT_IN' | 'EXACT_OUT' | 'EXACT_DOLLAR';
  quantity: number;
  tokenA: string;
  tokenB: string;
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: SwapChatContent;
}> {
  let rpc = import.meta.env.VITE_SOLANA_RPC;
  if (!rpc) {
    return {
      status: 'error',
      response: 'No RPC URL found. Ask the user to contact admin.',
    };
  }

  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `OnChain Handler: Preparing Token Swap...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  if (args.currentWallet === null) {
    return {
      status: 'error',
      response:
        'No wallet connected. Ask the user to connect wallet before performing swap.',
    };
  }
  let wallet = args.currentWallet;
  let connection = new Connection(rpc);

  const input_mint = args.tokenA.length > 35 ? args.tokenA : `$${args.tokenA}`;
  const output_mint = args.tokenB.length > 35 ? args.tokenB : `$${args.tokenB}`;

  let params: SwapParams = {
    swap_mode: args.swapType,
    amount: args.quantity,
    input_mint: input_mint,
    output_mint: output_mint,
    public_key: wallet.address,
    priority_fee_needed: false,
  };

  try {
    let swap_txn = await swapTx(params);
    if (!swap_txn) {
      return {
        status: 'error',
        response: 'Swap transaction creation failed',
      };
    }

    useChatMessageHandler.getState().setCurrentChatItem({
      content: {
        type: 'loader_message',
        text: `OnChain Handler: Waiting for wallet signature...`,
        response_id: 'temp',
        sender: 'system',
      },
      id: 0,
      createdAt: new Date().toISOString(),
    });
    
    const signedTransaction = await wallet.signTransaction(swap_txn);
    const rawTransaction = signedTransaction.serialize();

    useChatMessageHandler.getState().setCurrentChatItem({
      content: {
        type: 'loader_message',
        text: `OnChain Handler: Submitting transaction...`,
        response_id: 'temp',
        sender: 'system',
      },
      id: 0,
      createdAt: new Date().toISOString(),
    });

    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 10,
    });

    const data: SwapChatContent = {
      response_id: 'temp',
      sender: 'system',
      type: 'swap',
      data: {
        swap_mode: args.swapType,
        amount: args.quantity,
        input_mint: input_mint,
        output_mint: output_mint,
        public_key: wallet.address,
        priority_fee_needed: false,
      },
      txn: txid,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    return {
      status: 'success',
      response: `Swap for ${args.quantity} ${args.tokenA} to ${args.tokenB} has been submitted.`,
      props: data,
    };
  } catch (error) {
    console.error('Swap error:', error);
    return {
      status: 'error',
      response: `Swap failed`,
    };
  }
}


