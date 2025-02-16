import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { Tool } from '../types/tool';
import { useChatMessageHandler } from '../models/ChatMessageHandler';
import {
  SimpleMessageChatContent,
  TransactionChatContent,
} from '../types/chatItem';
import { WithdrawParams } from '../types/lulo';
import { tokenList } from '../config/tokens/tokenMapping';
import { withdrawLuloTx } from '../lib/solana/lulo';
import { Connection } from '@solana/web3.js';
import { TransactionCard } from '../types/messageCard';
import { TransactionDataMessageItem } from '../components/ui/message_items/TransactionCard.tsx';

const functionDescription =
  'Call this function ONLY when the user explicitly requests to withdraw stable coins from Lulo. Ensure the user specifies the correct stable coin (USDS or USDC) and an amount. DO NOT assume or attach any arbitrary number if unclear. USDS and USDC are DISTINCT coins—select appropriately. This function is NOT for deposits or any other operation. Confirm the user’s intent before proceeding if you are unsure of the intent.';

export const withdrawLulo: Tool = {
  implementation: withdrawLuloFunction,
  representation: {
    props_type: 'withdraw_lulo',
    component: TransactionDataMessageItem,
  },
  abstraction: {
    type: 'function',
    name: 'withdrawLulo',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Amount of stable coin to withdraw.',
        },
        all: {
          type: 'boolean',
          description:
            'If the user wants to withdraw all the stable coin of type token from lulo.',
        },
        token: {
          type: 'string',
          enum: ['USDT', 'USDS', 'USDC'],
          description: 'The stable coin that the user wants to withdraw.',
        },
      },
      required: ['token'],
    },
  },
};

// TODO: Shift the trigger logic here from conversation.tsx
export async function withdrawLuloFunction(args: {
  amount: number;
  token: 'USDT' | 'USDS' | 'USDC';
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: TransactionChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      response_id: 'temp',
      text: 'Creating a withdrawal transaction...',
    } as SimpleMessageChatContent,
    id: 0,
    createdAt: new Date().toISOString(),
  });

  const rpc = import.meta.env.VITE_SOLANA_RPC;

  if (!args.currentWallet) {
    return {
      status: 'error',
      response: 'Please connect your wallet first.',
    };
  }
  if (!rpc) {
    return {
      status: 'error',
      response: 'RPC endpoint not found.',
    };
  }

  const params: WithdrawParams = {
    owner: `${args.currentWallet.address}`,
    withdrawAmount: args.amount,
    mintAddress: tokenList[args.token].MINT,
    withdrawAll: false,
  };
  const connection = new Connection(rpc);

  try {
    const resp = await withdrawLuloTx(params);
    if (!resp) {
      return {
        status: 'error',
        response: 'Withdrawal failed. Please try again later.',
      };
    }

    for (const transaction of resp) {
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.message.recentBlockhash = blockhash;
      console.log(transaction);

      const signedTransaction =
        await args.currentWallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
      );

      const data: TransactionCard = {
        link: signature,
        title: 'completed',
        status: 'success',
      };

      const uiProps: TransactionChatContent = {
        response_id: 'temp',
        sender: 'assistant',
        type: 'transaction_message',
        data,
      };

      return {
        status: 'success',
        response: 'Withdrawal successful.',
        props: uiProps,
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
      response: 'Withdrawal failed. Please try again later.',
    };
  }
}
