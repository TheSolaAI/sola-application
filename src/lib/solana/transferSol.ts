import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

export async function transferSolTx(
  senderAddress: string,
  recipientAddress: string,
  amount: number
) {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(senderAddress),
      toPubkey: new PublicKey(recipientAddress),
      lamports: amount,
    })
  );

  transaction.feePayer = new PublicKey(senderAddress);
  return transaction;
}
