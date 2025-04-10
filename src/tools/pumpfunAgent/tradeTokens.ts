'use client';

import { z } from 'zod';
import { registerTool } from '@/lib/registry/toolRegistry';

import { VersionedTransaction } from '@solana/web3.js';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { pfBuyTx, pfSellTx } from '@/lib/solana/pumpfun';
import { PfBuyParams, PfSellParams } from '@/types/pumpfun';
import { ToolResult } from '@/types/tool';
import { useWalletHandler } from '@/store/WalletHandler';
import { TransactionChatContent } from '@/types/chatItem';
import { TransactionDataMessageItem } from '@/components/messages/TransactionCard';

export const pfTransactionSchema = z.object({
  action: z.enum(['buy', 'sell']),
  amount: z.number(),
  token: z.string(),
  slippage: z.number().default(0.2),
});

const pfTransactionImplementation = async (
  args: z.infer<typeof pfTransactionSchema>,
  response_id: string
): Promise<ToolResult<'transaction_message'>> => {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Token Transaction agent: Processing ${args.action.toLowerCase()} transaction for ${args.amount} ${args.token}...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  const currentWallet = useWalletHandler.getState().currentWallet;
  if (!currentWallet) {
    return {
      status: 'error',
      response: 'Please connect your wallet first.',
    };
  }

  // Determine if token is provided as an address or symbol
  const tokenMint = args.token.length > 35 ? args.token : `$${args.token}`;

  try {
    // Define transaction functions lookup
    const transactionFunctions = {
      buy: async () => {
        const params: PfBuyParams = {
          output_mint: tokenMint,
          public_key: currentWallet.address,
          amount: args.amount,
          slippage: args.slippage,
        };
        return await pfBuyTx(params);
      },
      sell: async () => {
        const params: PfSellParams = {
          input_mint: tokenMint,
          public_key: currentWallet.address,
          amount: args.amount,
          slippage: args.slippage,
        };
        return await pfSellTx(params);
      },
    };

    // Execute the appropriate function based on action
    const resp = await transactionFunctions[args.action]();
    const transaction = resp?.transaction;

    if (!transaction) {
      return {
        status: 'error',
        response: `Unable to process ${args.action.toLowerCase()} transaction.`,
      };
    }

    const transactionBuffer = Buffer.from(transaction, 'base64');
    const final_tx = VersionedTransaction.deserialize(transactionBuffer);
    const signedTransaction = await currentWallet.signTransaction(final_tx);
    const rawTransaction = signedTransaction.serialize();

    const response = await fetch('/api/send-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serializedTransaction: Buffer.from(rawTransaction).toString('base64'),
        options: {
          skipPreflight: true,
          maxRetries: 10,
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.status === 'error') {
      throw new Error(responseData.message || 'Failed to send transaction');
    }

    const txid = responseData.txid;

    const data: TransactionChatContent = {
      response_id,
      sender: 'system',
      type: 'transaction_message',
      data: {
        title: `PumpFun ${args.action.toUpperCase()} Transaction`,
        status: 'pending',
        link: `https://solscan.io/tx/${txid}`,
        amount: args.amount,
        tokenAddress: tokenMint,
        type: args.action,
      },
    };

    return {
      status: 'success',
      response: `${args.action} transaction processed successfully`,
      props: data,
    };
  } catch (error) {
    console.error(
      `Error processing ${args.action.toLowerCase()} transaction:`,
      error
    );
    return {
      status: 'error',
      response: `Unable to process ${args.action.toLowerCase()} transaction. Please try again later.`,
    };
  }
};

export const pfTransaction = registerTool({
  name: 'pumpfun_transaction',
  description:
    'Executes buy or sell transactions for tokens at market price with specified slippage in pumpfun. Use this for pumpfun trading.',
  propsType: 'transaction_message',
  cost: 0.00005,
  implementation: pfTransactionImplementation,
  component: TransactionDataMessageItem,
  customParameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['BUY', 'SELL'],
        description: 'Transaction action: either "BUY" or "SELL".',
      },
      amount: {
        type: 'number',
        description: 'The amount of token that the user wants to buy or sell',
      },
      token: {
        type: 'string',
        description: 'The token that the user wants to buy or sell',
      },
      slippage: {
        type: 'number',
        description:
          'The slippage tolerance for the transaction (default 0.2 or 20%)',
      },
    },
    required: ['action', 'amount', 'token'],
  },
});
