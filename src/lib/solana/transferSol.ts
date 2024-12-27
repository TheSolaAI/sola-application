import {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
} from '@solana/web3.js';

export async function transferSolTx(address: string, connection: Connection) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(address),
      toPubkey: new PublicKey('HvkuF3RXZ4kkWr8icix6Tvk1XzGFKbgPg2WpHz2DQMTy'),
      lamports: 100000,
    }),
  );
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = new PublicKey(address);

  return transaction;
}
