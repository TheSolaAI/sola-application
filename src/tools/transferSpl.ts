import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { Tool } from '../types/tool';
import { TransactionChatContent } from '../types/chatItem';
import { TransferChatItem } from '../components/messages/TransferMessageItem.tsx';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

const functionDescription =
  'Call this function when the user wants to send SPL tokens (non-SOL) to an address or a .sol domain. Do not autocorrect or modify .sol domains, as they are arbitrary and may not have meaningful words.';

export const transferSpl: Tool = {
  cost: 0.00005,
  implementation: transferSplTx,
  representation: {
    props_type: 'transfer_spl',
    component: TransferChatItem,
  },
  abstraction: {
    type: 'function',
    name: 'transferSpl',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Amount of the token to send.',
        },
        token: {
          type: 'string',
          description: 'The token that the user wants to send.',
        },
        address: {
          type: 'string',
          description: 'Recipient wallet address or .sol domain.',
        },
      },
      required: ['amount', 'token', 'address'],
    },
  },
};

export async function transferSplTx(args: {
  recipientAddress: string;
  amount: number;
  token: string;
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: TransactionChatContent;
}> {
  if (args.currentWallet === null) {
    return {
      status: 'error',
      response: 'Wallet not connected',
    };
  }
  let senderAddress = args.currentWallet.address;
  let recipientAddress = args.recipientAddress;
  let token = args.token;
  let amount = args.amount;
  let rpc = import.meta.env.VITE_SOLANA_RPC;
  let sola_ata_keypair = import.meta.env.VITE_ATA_PRIV_KEY;
  if (!rpc) {
    return {
      status: 'error',
      response: 'RPC not found. Ask user to contact admin.',
    };
  }
  if (!sola_ata_keypair) {
    return {
      status: 'error',
      response: 'Error during verification . Ask user to contact admin.',
    };
  }

  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `OnChain Handler: Transferring SPL...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  let b = bs58.decode(sola_ata_keypair);
  let j = new Uint8Array(
    b.buffer,
    b.byteOffset,
    b.byteLength / Uint8Array.BYTES_PER_ELEMENT,
  );
  let sola_payer = Keypair.fromSecretKey(j);
  const connection = new Connection(rpc);

  let sourceAccount = await getAssociatedTokenAddress(
    new PublicKey(token),
    new PublicKey(senderAddress),
  );

  let destinationAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sola_payer,
    new PublicKey(token),
    new PublicKey(recipientAddress),
  );

  const numberDecimals = await getNumberDecimals(token);

  const tx = new Transaction();
  tx.add(
    createTransferInstruction(
      sourceAccount,
      destinationAccount.address,
      new PublicKey(senderAddress),
      amount * Math.pow(10, numberDecimals),
    ),
  );
  tx.feePayer = new PublicKey(senderAddress);
  args.currentWallet.signTransaction(tx);
  const signature = await connection.sendRawTransaction(tx.serialize());

  let title = `Transfer ${amount} SOL to ${recipientAddress}`;
  let link = signature;

  const data: TransactionChatContent = {
    response_id: 'temp',
    sender: 'assistant',
    type: 'transfer_spl',
    data: {
      title,
      link,
      status: 'success',
    },
  };

  return {
    status: 'success',
    response: 'Transaction sent to blockchain.',
    props: data,
  };
}

async function getNumberDecimals(mintAddress: string): Promise<number> {
  let rpc = import.meta.env.VITE_SOLANA_RPC;

  if (!rpc) {
    return 0;
  }
  const connection = new Connection(rpc);
  const info = await connection.getParsedAccountInfo(
    new PublicKey(mintAddress),
  );
  const result = (info.value?.data as ParsedAccountData).parsed.info
    .decimals as number;
  return result;
}
