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
    'Creates a token swap transaction at current market prices. IMPORTANT: This tool requires actual token addresses (not symbols). If the user provides a token symbol or name, first use the TokenAddress tool to get the correct token address before using this tool.',
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
      inputTokenAddress: {
        type: 'string',
        description:
          'The token address (not symbol) to swap from. Must be a valid Solana SPL token address.',
      },
      outputTokenAddress: {
        type: 'string',
        description:
          'The token address (not symbol) to receive. Must be a valid Solana SPL token address.',
      },
    },
    required: [
      'swapType',
      'quantity',
      'inputTokenAddress',
      'outputTokenAddress',
    ],
  },
});

async function swapTokensFunction(
  args: {
    swapType: 'EXACT_IN' | 'EXACT_OUT' | 'EXACT_DOLLAR';
    quantity: number;
    inputTokenAddress: string;
    outputTokenAddress: string;
  },
  response_id: string
): Promise<ToolResult<'swap'>> {
  // Input validation
  if (args.quantity <= 0) {
    return {
      status: 'error',
      response: 'Swap amount must be greater than zero.',
    };
  }

  // Validate that inputs appear to be token addresses
  if (
    args.inputTokenAddress.length < 32 ||
    args.outputTokenAddress.length < 32
  ) {
    return {
      status: 'error',
      response:
        'Invalid token addresses provided. Please use the TokenAddress tool first to get valid token addresses from symbols or names.',
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

  const wallet = useWalletHandler.getState().currentWallet;
  if (wallet === null) {
    return {
      status: 'error',
      response:
        'No wallet connected. Ask the user to connect wallet before performing swap.',
    };
  }

  // Create shortened versions for display
  const inputTokenDisplay = `${args.inputTokenAddress.substring(0, 4)}...${args.inputTokenAddress.substring(args.inputTokenAddress.length - 4)}`;
  const outputTokenDisplay = `${args.outputTokenAddress.substring(0, 4)}...${args.outputTokenAddress.substring(args.outputTokenAddress.length - 4)}`;

  const params: SwapParams = {
    swap_mode: args.swapType,
    amount: args.quantity,
    input_mint: args.inputTokenAddress,
    output_mint: args.outputTokenAddress,
    public_key: wallet.address,
    priority_fee_needed: false,
  };

  try {
    const swap_res = await swapTx(params);
    if (!swap_res) {
      return {
        status: 'error',
        response: `Swap transaction creation failed. Please check that you have sufficient balance and that the token pair is valid.`,
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
      body: JSON.stringify({
        serializedTransaction: serializedTx,
        options: {
          skipPreflight: false,
          maxRetries: 3,
        },
      }),
    });

    if (!sendRes.ok) {
      const errorData = await sendRes.json();
      console.log(errorData);
      return {
        status: 'error',
        response: `Swap failed: While sending transaction to blockchain.`,
      };
    }

    const { txid } = await sendRes.json();

    const data: SwapChatContent = {
      response_id: response_id,
      sender: 'system',
      type: 'swap',
      data: {
        swap_mode: args.swapType,
        amount: args.quantity,
        output_amount: swap_res.outAmount,
        input_mint: args.inputTokenAddress,
        output_mint: args.outputTokenAddress,
        public_key: wallet.address,
        priority_fee_needed: false,
      },
      txn: txid,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    return {
      status: 'success',
      response: `Swap transaction for ${args.quantity} tokens (${inputTokenDisplay}) to approximately ${swap_res.outAmount} tokens (${outputTokenDisplay}) has been submitted. You can track the transaction status in the UI.`,
      props: data,
    };
  } catch (error) {
    console.error('Swap error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      status: 'error',
      response: `Swap failed: ${errorMessage}. Please try again or check your wallet balance.`,
    };
  }
}
