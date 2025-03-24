'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { SwapParams } from '@/types/jupiter';
import { swapTx } from '@/lib/solana/swapTx';
import { SwapChatContent } from '@/types/chatItem';
import { SwapChatItem } from '@/components/messages/SwapMessageItem';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ToolResult } from '@/types/tool';
import { useWalletHandler } from '@/store/WalletHandler';

export const swapTokens = registerTool({
  name: 'swapTokens',
  description:
    'Use this function when the user wants to swap one token for another at market price. The user may specify the amount of tokenA (in tokens or USD) or the amount of tokenB to receive. Do NOT use this for limit orders.',
  propsType: 'swap',
  cost: 0.00005,
  implementation: swapTokensFunction,
  component: SwapChatItem,
  customParameters: {
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
});

async function swapTokensFunction(
  args: {
    swapType: 'EXACT_IN' | 'EXACT_OUT' | 'EXACT_DOLLAR';
    quantity: number;
    tokenA: string;
    tokenB: string;
  },
  response_id: string
): Promise<ToolResult<'swap'>> {
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

  const wallet = useWalletHandler.getState().currentWallet;
  if (wallet === null) {
    return {
      status: 'error',
      response:
        'No wallet connected. Ask the user to connect wallet before performing swap.',
    };
  }

  const input_mint = args.tokenA.length > 35 ? args.tokenA : `$${args.tokenA}`;
  const output_mint = args.tokenB.length > 35 ? args.tokenB : `$${args.tokenB}`;

  const params: SwapParams = {
    swap_mode: args.swapType,
    amount: args.quantity,
    input_mint: input_mint,
    output_mint: output_mint,
    public_key: wallet.address,
    priority_fee_needed: false,
  };

  try {
    const swap_res = await swapTx(params);
    if (!swap_res) {
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

    const signedTransaction = await wallet.signTransaction(
      swap_res.transaction
    );
    //add a sign error check here TODO!!!
    const serializedTx = Buffer.from(signedTransaction.serialize()).toString(
      'base64'
    );

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

    const sendRes = await fetch('/api/wallet/sendTransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serializedTransaction: serializedTx }),
    });

    const { txid } = await sendRes.json();

    const data: SwapChatContent = {
      response_id: response_id,
      sender: 'system',
      type: 'swap',
      data: {
        swap_mode: args.swapType,
        amount: args.quantity,
        output_amount: swap_res.outAmount,
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
      response: `Swap for ${args.quantity} ${args.tokenA} to ${swap_res.outAmount} ${args.tokenB} has been submitted.`,
      props: data,
    };
  } catch (error) {
    console.error('Swap error:', error);
    if (String(error).includes('WalletSignTransactionError')) {
      return {
        status: 'error',
        response: `User rejected the transaction`,
      };
    } else {
      return {
        status: 'error',
        response: `Swap failed`,
      };
    }
  }
}
