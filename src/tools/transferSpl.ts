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
import { TransactionChatContent} from '../types/chatItem';
import { TransferChatItem } from '../components/ui/message_items/TransferMessageItem.tsx';

const functionDescription =
  'Call this function when the user wants to send tokens that are not SOLANA or SOL using address or .sol domain. the .sol domains are random and doesnt need to make sense in meaining, so dont autocorrect anything from .sol domains.';

export const transferSpl: Tool = {
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
          description: 'Quantity of tokenA to swap.',
        },
        token: {
          type: 'string',
          enum: ['SOLA', 'USDC', 'JUP', 'USDT', 'BONK'],
          description: 'The token that the user wants to send.',
        },
        address: {
          type: 'string',
          description: 'Recipient address or his .sol domain.',
        },
      },
      required: ['quantity', 'token', 'address'],
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
  props?: TransactionChatContent ;
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
  let rpc = process.env.SOLANA_RPC;
  let sola_ata_keypair = process.env.SOLANA_ATA_KEYPAIR;
  if (!rpc) {
    return {
      status: 'error',
      response: 'RPC not found',
    };
  }
  if (!sola_ata_keypair) {
    return {
      status: 'error',
      response: 'SOLANA_ATA_KEYPAIR not found',
    };
  }
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
  console.log(sola_payer.publicKey.toBase58());
  let destinationAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sola_payer,
    new PublicKey(token),
    new PublicKey(recipientAddress),
  );
  console.log(destinationAccount.address);

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

  let title = `Transfer ${amount} SOL to ${recipientAddress}`
  let link = signature

  const data: TransactionChatContent  = {
    response_id: 'temp',
    sender: 'assistant',
    type: 'transfer_spl',
    data: {
      title,
      link,
      status:"success"
    }
  };

  return {
    status: 'success',
    response: 'Transaction sent',
    props: data,
  };
}

async function getNumberDecimals(mintAddress: string): Promise<number> {
  let rpc = process.env.SOLANA_RPC;

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
