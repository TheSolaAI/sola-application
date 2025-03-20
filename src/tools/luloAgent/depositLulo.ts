'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { DepositParams } from '@/types/lulo';
import { tokenList } from '@/config/tokenMapping';
import { depositLuloTx } from '@/lib/solana/lulo';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { TransactionChatContent } from '@/types/chatItem';
import { TransactionCard } from '@/types/messageCard';
import { ToolResult } from '@/types/tool';
import { useWalletHandler } from '@/store/WalletHandler';
import { TransactionDataMessageItem } from '@/components/messages/TransactionCard';

async function handleDepositLulo(
  args: {
    amount: number;
    token: 'USDT' | 'USDS' | 'USDC';
  },
  response_id: string
): Promise<ToolResult<'transaction_message'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Lulo agent: Depositing assets...`,
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
      response: 'Ask user to connect wallet first, before trying to deposit.',
    };
  }

  const params: DepositParams = {
    owner: `${currentWallet.address}`,
    depositAmount: args.amount,
    mintAddress: tokenList[args.token].MINT,
  };

  try {
    const resp = await depositLuloTx(params);
    if (!resp) {
      return {
        status: 'error',
        response: 'Deposit failed. Ask user to try again later.',
      };
    }

    for (const transaction of resp) {
      // Fetch latest blockhash from the API
      const blockhashRes = await fetch('/api/wallet/blockhash');
      const { blockhash } = await blockhashRes.json();
      transaction.message.recentBlockhash = blockhash;

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
        title: txid,
        status: 'success',
        link: txid,
      };

      const transactionContent: TransactionChatContent = {
        response_id,
        sender: 'assistant',
        type: 'transaction_message',
        data: transactionData,
      };

      return {
        status: 'success',
        response: 'Deposit successful.',
        props: transactionContent,
      };
    }

    return {
      status: 'success',
      response: 'Deposit successful.',
    };
  } catch (error) {
    console.error('Error during deposit:', error);
    return {
      status: 'error',
      response: 'Deposit failed. Ask user to try again later.',
    };
  }
}

export const depositLulo = registerTool({
  name: 'depositLulo',
  description:
    'Call this function ONLY when the user explicitly requests to deposit stable coins into Lulo Finance.',
  propsType: 'transaction_message',
  cost: 0.00005,
  implementation: handleDepositLulo,
  component: TransactionDataMessageItem,
  customParameters: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount of stable coin that the user wants to deposit.',
      },
      token: {
        type: 'string',
        enum: ['USDT', 'USDS', 'USDC'],
        description:
          'The symbol/name of the stable coin user wants to deposit.',
      },
      currentWallet: {
        type: 'object',
        description: 'The current wallet of the user',
      },
    },
    required: ['amount', 'token', 'currentWallet'],
  },
});
