import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { Tool } from '../types/tool';
import { TransactionChatContent } from '../types/chatItem';
import { TransferChatItem } from '../components/ui/message_items/TransferMessageItem.tsx';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

const functionDescription =
  'Call this function when the user wants to send SOL (Solana) to a recipient using either a wallet address or a .sol domain. Do not modify or autocorrect .sol domains, as they are arbitrary and may not have meaningful words.';

export const transferSolTx: Tool = {
  cost: 0.00005,
  implementation: transferSolTxFunction,
  representation: {
    props_type: 'transfer_sol',
    component: TransferChatItem,
  },
  abstraction: {
    type: 'function',
    name: 'transferSolTx',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description:
            'Amount of SOL (Solana) to transfer. This value should be in SOL, not lamports.',
        },
        address: {
          type: 'string',
          description: 'Recipient wallet address or a .sol domain.',
        },
      },
      required: ['quantity', 'address'],
    },
  },
};

export async function transferSolTxFunction(args: {
  recipientAddress: string;
  amount: number;
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: TransactionChatContent;
}> {
  if (args.currentWallet === null) {
    return {
      status: 'error',
      response:
        'No wallet connected. Ask the user to connect wallet before trying to transfer.',
    };
  }
  const rpc = import.meta.env.VITE_SOLANA_RPC;
  if (rpc === undefined) {
    return {
      status: 'error',
      response: 'RPC URL not found. Ask the user to contact admin.',
    };
  }

  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `OnChain Handler: Transferring SOL...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  const senderAddress = args.currentWallet.address;
  const recipientAddress = args.recipientAddress;
  const amount = args.amount;
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(senderAddress),
      toPubkey: new PublicKey(recipientAddress),
      lamports: amount,
    }),
  );
  const connection = new Connection(rpc);
  let signer = args.currentWallet;
  transaction.feePayer = new PublicKey(senderAddress);
  signer.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
  );
  let title = `Transfer ${amount} SOL to ${recipientAddress}`;
  let link = signature;

  const data: TransactionChatContent = {
    response_id: 'temp',
    sender: 'assistant',
    type: 'transfer_sol',
    data: {
      title,
      link,
      status: 'success',
    },
  };

  return {
    status: 'success',
    response: 'Transaction sent to the blockcahin.',
    props: data,
  };
}
