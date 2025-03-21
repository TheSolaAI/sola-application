import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import {
  Account,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import bs58 from 'bs58';

const rpc = import.meta.env.VITE_SOLANA_RPC;
const sola_ata_keypair = import.meta.env.VITE_ATA_PRIV_KEY;

export async function transferSplTx(
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  token: string
): Promise<Transaction | null> {
  if (!rpc) {
    return null;
  }
  if (!sola_ata_keypair) {
    return null;
  }
  const b = bs58.decode(sola_ata_keypair);
  const j = new Uint8Array(
    b.buffer,
    b.byteOffset,
    b.byteLength / Uint8Array.BYTES_PER_ELEMENT
  );
  const sola_payer = Keypair.fromSecretKey(j);
  const connection = new Connection(rpc);
  const sourceAccount = await getAssociatedTokenAddress(
    new PublicKey(token),
    new PublicKey(senderAddress)
  );
  console.log(sola_payer.publicKey.toBase58());
  const destinationAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sola_payer,
    new PublicKey(token),
    new PublicKey(recipientAddress)
  );
  console.log(destinationAccount.address);

  const numberDecimals = await getNumberDecimals(token);

  const tx = new Transaction();
  tx.add(
    createTransferInstruction(
      sourceAccount,
      destinationAccount.address,
      new PublicKey(senderAddress),
      amount * Math.pow(10, numberDecimals)
    )
  );
  tx.feePayer = new PublicKey(senderAddress);
  return tx;
}

async function getNumberDecimals(mintAddress: string): Promise<number> {
  if (!rpc) {
    return 0;
  }
  const connection = new Connection(rpc);
  const info = await connection.getParsedAccountInfo(
    new PublicKey(mintAddress)
  );
  const result = (info.value?.data as ParsedAccountData).parsed.info
    .decimals as number;
  return result;
}
