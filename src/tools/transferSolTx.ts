import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Tool } from "../types/tool";
import { TransferChatContent } from "../types/chatItem";

const functionDescription =
  'Call this function when the user wants to send SOLANA or SOL using address or .sol domain. the .sol domains are random and doesnt need to make sense in meaining, so dont autocorrect anything from .sol domains.';

export const transferSolTx:Tool = {
  implementation: transferSolTxFunction,
  representation: {
    props_type: 'transfer_sol',
    component: TransferMessageItem,
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
          description: 'Amount of Solana or SOL to transfer.',
        },
        address: {
          type: 'string',
          description: 'Recipient address or his .sol domain.',
        },
      },
      required: ['quantity', 'address'],
    },
  }
};

export async function transferSolTxFunction(args: {
  recipientAddress: string,
  amount: number,
  currentWallet: ConnectedSolanaWallet | null;
}): Promise<{status: 'success' | 'error',
response: string,
props?: TransferChatContent,
  }>
{
  if (args.currentWallet === null) {
    return {
      status: 'error',
      response: 'No wallet connected',
    };
  }
  const rpc = process.env.SOLANA_RPC;
  if (rpc === undefined) {
    return {
      status: 'error',
      response: 'RPC URL not found',
    };
  }
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
  const signature = await connection.sendRawTransaction(transaction.serialize());
  const data: TransferChatContent = {
    response_id: 'temp',
    sender: 'assistant',
    type: 'transfer',
    from: senderAddress,
    to: recipientAddress,
    amount: amount,
    token: 'SOL',
    status: 'success',
    txn: signature,
  }
  return {
    status: 'success',
    response: 'Transaction sent',
    props: data,
  };
}
