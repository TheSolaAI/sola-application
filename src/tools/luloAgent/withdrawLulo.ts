'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { WithdrawParams } from '@/types/lulo';
import { tokenList } from '@/config/tokenMapping';
import { withdrawLuloTx } from '@/lib/solana/lulo';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { TransactionChatContent } from '@/types/chatItem';
import { TransactionCard } from '@/types/messageCard';
import { TransactionDataMessageItem } from '@/components/messages/TransactionCard';
import { ToolResult } from '@/types/tool';
import { useWalletHandler } from '@/store/WalletHandler';

// Implementation function with response_id parameter
async function handleWithdrawLulo(
  args: {
    amount: number;
    token: 'USDT' | 'USDS' | 'USDC';
  },
  response_id: string
): Promise<ToolResult<'transaction_message'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Lulo agent: Withdrawing assets...`,
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
      response: 'Ask user to connect wallet first, before trying to withdraw.',
    };
  }

  const params: WithdrawParams = {
    owner: `${currentWallet.address}`,
    withdrawAmount: args.amount,
    mintAddress: tokenList[args.token].MINT,
    withdrawAll: false,
  };

  try {
    const resp = await withdrawLuloTx(params);
    if (!resp) {
      return {
        status: 'error',
        response: 'Withdrawal failed. Tell user to try again later.',
      };
    }

    for (const transaction of resp) {
      const blockhashRes = await fetch('/api/wallet/blockhash');
      const { blockhash } = await blockhashRes.json();
      transaction.message.recentBlockhash = blockhash;
      console.log(transaction);

      const signedTransaction =
        await currentWallet.signTransaction(transaction);
      const serializedTx = Buffer.from(signedTransaction.serialize()).toString(
        'base64'
      );

      // Send the transaction through the API
      const sendRes = await fetch('/api/wallet/sendTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serializedTransaction: serializedTx }),
      });

      const { txid } = await sendRes.json();

      const transactionData: TransactionCard = {
        link: txid,
        title: 'Withdrawal Completed',
        status: 'success',
      };

      // Create the properly typed TransactionChatContent
      const transactionContent: TransactionChatContent = {
        response_id: response_id,
        sender: 'assistant',
        type: 'transaction_message',
        data: transactionData,
      };

      return {
        status: 'success',
        response: 'Withdrawal successful.',
        props: transactionContent,
      };
    }

    return {
      status: 'success',
      response: 'Withdrawal successful.',
    };
  } catch (error) {
    console.error('Error during withdrawal:', error);
    return {
      status: 'error',
      response: 'Withdrawal failed. Ask user to try again later.',
    };
  }
}

// Register the tool using the registry
export const withdrawLulo = registerTool({
  name: 'withdrawLulo',
  description:
    "Call this function ONLY when the user explicitly requests to withdraw stable coins from Lulo. Ensure the user specifies the correct stable coin (USDS or USDC) and an amount. DO NOT assume or attach any arbitrary number if unclear. USDS and USDC are DISTINCT coins—select appropriately. This function is NOT for deposits or any other operation. Confirm the user's intent before proceeding if you are unsure of the intent.",
  propsType: 'transaction_message',
  cost: 0.00005,
  implementation: handleWithdrawLulo,
  component: TransactionDataMessageItem,
  customParameters: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount of stable coin to withdraw.',
      },
      token: {
        type: 'string',
        enum: ['USDT', 'USDS', 'USDC'],
        description: 'The stable coin that the user wants to withdraw.',
      },
      currentWallet: {
        type: 'object',
        description: 'The current wallet of the user',
      },
    },
    required: ['amount', 'token', 'currentWallet'],
  },
});
