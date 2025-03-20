'use client';

import { z } from 'zod';
import { registerTool } from '@/lib/registry/toolRegistry';
import { CreateLimitOrderChatItem } from '@/components/messages/CreateLimitOrderMessageItem';
import { VersionedTransaction } from '@solana/web3.js';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { LimitOrderChatContent } from '@/types/chatItem';
import { limitOrderTx } from '@/lib/solana/limitOrderTx';
import { LimitOrderParams } from '@/types/jupiter';
import { ToolResult } from '@/types/tool';
import { useWalletHandler } from '@/store/WalletHandler';

export const limitOrderSchema = z.object({
  action: z.enum(['BUY', 'SELL']),
  amount: z.number(),
  token: z.string(),
  limitPrice: z.number(),
});

const createLimitOrderImplementation = async (
  args: z.infer<typeof limitOrderSchema>,
  response_id: string
): Promise<ToolResult<'create_limit_order'>> => {
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

  const currentWallet = useWalletHandler.getState().currentWallet;
  if (!currentWallet) {
    return {
      status: 'error',
      response: 'Please connect your wallet first.',
    };
  }

  // Determine if token is provided as an address or symbol
  const input_mint = args.token.length > 35 ? args.token : `$${args.token}`;

  const params: LimitOrderParams = {
    token_mint_a: input_mint,
    token_mint_b: '$USDC',
    public_key: currentWallet.address,
    amount: args.amount,
    limit_price: args.limitPrice,
    action: args.action,
  };

  try {
    const resp = await limitOrderTx(params);
    if (resp) {
      const transaction = resp.tx;
      if (!transaction) {
        return {
          status: 'error',
          response: 'Unable to place limit order.',
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

      const data: LimitOrderChatContent = {
        response_id,
        sender: 'system',
        type: 'create_limit_order',
        data: {
          amount: args.amount,
          input_mint,
          output_mint: 'USDC',
          limit_price: args.limitPrice,
          action: args.action,
          priority_fee_needed: false,
        },
        txn: txid,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };

      return {
        status: 'success',
        response: `Limit order created successfully`,
        props: data,
      };
    } else {
      return {
        status: 'error',
        response:
          'Unable to place limit order. Make sure your order is worth more than $5 and you have enough balance.',
      };
    }
  } catch (error) {
    console.error('Error creating limit order:', error);
    return {
      status: 'error',
      response:
        'Unable to place limit order. Do not add this limit order into completed.',
    };
  }
};

export const limitOrder = registerTool({
  name: 'limitOrder',
  description:
    'Creates a limit order to buy or sell a specified token at a user-defined price in USD. Do not use this for instant token swaps or market orders. Only use when the user explicitly requests a limit order. e.g. command: buy/sell 10 "token-name" when price is at "x" usd',
  propsType: 'create_limit_order',
  cost: 0.00005,
  implementation: createLimitOrderImplementation,
  component: CreateLimitOrderChatItem,
  customParameters: {
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
        description: 'The limit price specified by the user in USD',
      },
    },
    required: ['action', 'amount', 'token', 'limitPrice'],
  },
});
