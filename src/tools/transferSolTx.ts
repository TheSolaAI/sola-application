import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

const functionDescription =
  'Call this function when the user wants to send SOLANA or SOL using address or .sol domain. the .sol domains are random and doesnt need to make sense in meaining, so dont autocorrect anything from .sol domains.';

export const transferSolTx = {
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
};

//TODO: Shift the logic here from conversation.tsx
export async function transferSolTxFunction(args: {
  senderAddress: string,
  recipientAddress: string,
  amount: number,
}) {
  const senderAddress = args.senderAddress;
  const recipientAddress = args.recipientAddress;
  const amount = args.amount;
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(senderAddress),
      toPubkey: new PublicKey(recipientAddress),
      lamports: amount,
    }),
  );

  transaction.feePayer = new PublicKey(senderAddress);
  return transaction;
}
