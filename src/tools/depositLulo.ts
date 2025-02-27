import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { Tool } from '../types/tool.ts';
import { DepositParams } from '../types/lulo.ts';
import { Connection } from '@solana/web3.js';
import { tokenList } from '../config/tokens/tokenMapping.ts';
import { depositLuloTx } from '../lib/solana/lulo.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { TransactionChatContent } from '../types/chatItem.ts';
import { TransactionCard } from '../types/messageCard.ts';
import { TransactionDataMessageItem } from '../components/ui/message_items/TransactionCard.tsx';

const functionDescription =
  'Call this function ONLY when the user explicitly requests to deposit stable coins into Lulo Finance. Ensure the user specifies the correct stable coin (USDC, USDS, or USDT) and an amount. DO NOT make assumptions about the coin or the amount if unclear. These are DISTINCT coins—choose appropriately. This function is NOT for withdrawals or any other operation.';

export const depositLulo: Tool = {
  implementation: handleDepositLulo,
  representation: {
    props_type: 'transaction_message',
    component: TransactionDataMessageItem,
  },
  abstraction: {
    type: 'function',
    name: 'depositLulo',
    description: functionDescription,
    parameters: {
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
      },
      required: ['amount', 'token'],
    },
  },
  cost: 10,
};

export async function handleDepositLulo(args: {
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
      type: 'loader_message',
      text: `Lulo agent: Depositing assets...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });
  const rpc = import.meta.env.VITE_SOLANA_RPC;

  if (!args.currentWallet) {
    return {
      status: 'error',
      response: 'Ask user to connect wallet first, Before trying to deposit.',
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
        signedTransaction.serialize(),
      );

      const data: TransactionCard = {
        title: signature,
        status: 'success',
        link: signature,
      };

      const uiProps: TransactionChatContent = {
        response_id: 'temp',
        sender: 'assistant',
        type: 'transaction_message',
        data,
      };

      return {
        status: 'success',
        response: 'Deposit successful.',
        props: uiProps,
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
