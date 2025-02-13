import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { Connection } from "@solana/web3.js";
import { SwapParams } from "../types/jupiter";
import { tokenList } from "../config/tokens/tokenMapping";
import { swapTx } from "../lib/solana/swapTx";
import { Tool } from "../types/tool";
import { SwapChatContent } from "../types/chatItem";

const functionDescription =
  'Call this function when the user wants to swap tokens. The swap can be based on a specific amount of tokenA (interpreted as a dollar amount or token quantity), or to receive a specified amount of tokenB.';

export const swapTokens:Tool = {
  implementation: swapTokensFunction,
  representation: {
    props_type: 'swap',
    component: SwapMessageItem,
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
            'The type of swap: EXACT_IN specifies the number of token a to be swapped, EXACT_OUT specifies the number of token b to be received, and EXACT_DOLLAR specifies the dollar amount to be swapped.',
        },
        quantity: {
          type: 'number',
          description:
            'The amount for the swap. This can represent a token quantity (if swapType is TOKEN_TO_TOKEN or TOKEN_TO_DOLLAR) or a dollar amount (if swapType is DOLLAR_TO_TOKEN).',
        },
        tokenA: {
          type: 'string',
          enum: ['SOL', 'SOLA', 'USDC', 'JUP', 'USDT', 'BONK'],
          description: 'The token that the user wants to swap.',
        },
        tokenB: {
          type: 'string',
          enum: ['SOL', 'SOLA', 'USDC', 'JUP', 'USDT', 'BONK'],
          description: 'The token that the user wants to receive.',
        },
      },
      required: ['swapType', 'amount', 'tokenA', 'tokenB'],
    },
  }
};

export async function swapTokensFunction(args: {
  swapType: 'EXACT_IN' | 'EXACT_OUT' | 'EXACT_DOLLAR';
  quantity: number;
  tokenA: 'SOL' | 'SOLA' | 'USDC' | 'JUP' | 'USDT' | 'BONK';
  tokenB: 'SOL' | 'SOLA' | 'USDC' | 'JUP' | 'USDT' | 'BONK';
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: SwapChatContent;
}>
{
  let rpc = process.env.SOLANA_RPC;
  if (!rpc) {
    return {
      status: 'error',
      response: 'No RPC URL found',
    };
  }
  if (args.currentWallet === null) {
    return {
      status: 'error',
      response: 'No wallet connected',
    };
  }
  let wallet = args.currentWallet;
  let connection = new Connection(rpc);

  let params: SwapParams = {
    swap_mode: args.swapType,
    amount: args.quantity,
    input_mint: tokenList[args.tokenA].MINT,
    output_mint: tokenList[args.tokenB].MINT,
    public_key: wallet.address,
  };

  let swap_txn = await swapTx(params);
  if (!swap_txn) {
    return {
      status: 'error',
      response: 'Swap failed',
    };
  }
  const signedTransaction = await wallet.signTransaction(swap_txn);

  const rawTransaction = signedTransaction.serialize();

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
        input_mint: tokenList[args.tokenA].MINT,
        output_mint: tokenList[args.tokenB].MINT,
        public_key: wallet.address,
    },
    txn: txid
};
  return {
    status: 'success',
    response: `Swap successful. Transaction ID: ${txid}`,
    props: data
  }
}


