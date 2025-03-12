'use client';
import { registerTool } from '@/lib/registry/toolRegistry';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { DepositParams } from '@/types/lulo';
import { Connection } from '@solana/web3.js';
import { tokenList } from '@/config/tokenMapping';
import { depositLuloTx } from '@/lib/solana/lulo';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { TransactionChatContent } from '@/types/chatItem';
import { TransactionCard } from '@/types/messageCard';
import { TransactionDataMessageItem } from '@/components/messages/TransactionCard';
import { ToolResult } from '@/types/tool';

// Implementation function with response_id parameter
async function handleDepositLulo(
  args: {
    amount: number;
    token: 'USDT' | 'USDS' | 'USDC';
    currentWallet: ConnectedSolanaWallet | null;
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

  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC;

  if (!args.currentWallet) {
    return {
      status: 'error',
      response: 'Ask user to connect wallet first, before trying to deposit.',
    };
  }

  if (!rpc) {
    return {
      status: 'error',
      response: 'RPC endpoint not found. Ask user to contact administrator.',
    };
  }

  const params: DepositParams = {
    owner: `${args.currentWallet.address}`,
    depositAmount: args.amount,
    mintAddress: tokenList[args.token].MINT,
  };

  const connection = new Connection(rpc);

  try {
    const resp = await depositLuloTx(params);
    if (!resp) {
      return {
        status: 'error',
        response: 'Deposit failed. Ask user to try again later.',
      };
    }

    for (const transaction of resp) {
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.message.recentBlockhash = blockhash;
      console.log(transaction);
      const signedTransaction =
        await args.currentWallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      const data: TransactionCard = {
        title: signature,
        status: 'success',
        link: signature,
      };

      // Create a properly typed TransactionChatContent object
      const transactionContent: TransactionChatContent = {
        response_id: response_id,
        sender: 'assistant',
        type: 'transaction_message',
        data,
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

// Register the tool using the registry
export const depositLulo = registerTool({
  name: 'depositLulo',
  description:
    'Call this function ONLY when the user explicitly requests to deposit stable coins into Lulo Finance. Ensure the user specifies the correct stable coin (USDC, USDS, or USDT) and an amount. DO NOT make assumptions about the coin or the amount if unclear. These are DISTINCT coins—choose appropriately. This function is NOT for withdrawals or any other operation.',
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
          'The symbol/name of the stable coin user wants to deposit (USDC, USDS, or USDT).',
      },
      currentWallet: {
        type: 'object',
        description: 'The current wallet of the user',
      },
    },
    required: ['amount', 'token', 'currentWallet'],
  },
});
