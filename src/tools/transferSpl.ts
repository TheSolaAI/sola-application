import { createTransferInstruction, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Connection, Keypair, ParsedAccountData, PublicKey, Transaction } from "@solana/web3.js";

const functionDescription =
  'Call this function when the user wants to send tokens that are not SOLANA or SOL using address or .sol domain. the .sol domains are random and doesnt need to make sense in meaining, so dont autocorrect anything from .sol domains.';

export const transferSpl = {
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
};

export async function transferSplTx(args: {
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  token: string,
}): Promise<Transaction | null> {
  let senderAddress = args.senderAddress;
  let recipientAddress = args.recipientAddress;
  let token = args.token;
  let amount = args.amount;
  let rpc = process.env.SOLANA_RPC;
  let sola_ata_keypair = process.env.SOLANA_ATA_KEYPAIR;
  if (!rpc) {
    return null;
  }
  if (!sola_ata_keypair) {
    return null;
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
  return tx;
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