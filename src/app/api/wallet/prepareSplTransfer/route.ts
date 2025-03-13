import { NextResponse } from 'next/server';
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

interface PrepareTransferRequest {
  senderAddress: string;
  recipientAddress: string;
  tokenMint: string;
  amount: number;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = (await req.json()) as PrepareTransferRequest;
    const { senderAddress, recipientAddress, tokenMint, amount } = body;

    // Validate the request
    if (!senderAddress || !recipientAddress || !tokenMint || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const rpc = process.env.SOLANA_RPC_URL;
    const solaAtaPrivateKey = process.env.VITE_ATA_PRIV_KEY;

    if (!rpc || !solaAtaPrivateKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create connection
    const connection = new Connection(rpc);

    // Decode the private key (securely on the server side)
    const decodedKey = bs58.decode(solaAtaPrivateKey);
    const keypairSeed = new Uint8Array(
      decodedKey.buffer,
      decodedKey.byteOffset,
      decodedKey.byteLength / Uint8Array.BYTES_PER_ELEMENT
    );
    const solaPayer = Keypair.fromSecretKey(keypairSeed);

    // Get the source token account
    const sourceAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      new PublicKey(senderAddress)
    );

    // Get or create the destination token account
    const destinationAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      solaPayer,
      new PublicKey(tokenMint),
      new PublicKey(recipientAddress)
    );

    // Get token decimals
    const info = await connection.getParsedAccountInfo(
      new PublicKey(tokenMint)
    );

    if (!info.value) {
      return NextResponse.json(
        { error: 'Token info not found' },
        { status: 400 }
      );
    }

    const decimals = (info.value.data as ParsedAccountData).parsed.info
      .decimals as number;

    // Calculate the amount with decimals
    const adjustedAmount = amount * Math.pow(10, decimals);

    // Create a transfer instruction
    const transferInstruction = createTransferInstruction(
      sourceAccount,
      destinationAccount.address,
      new PublicKey(senderAddress),
      adjustedAmount
    );

    // Create a transaction
    const transaction = new Transaction().add(transferInstruction);

    // Get a recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(senderAddress);

    // Serialize the transaction
    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString('base64');

    // Return the serialized transaction
    return NextResponse.json({
      serializedTransaction,
      destinationAddress: destinationAccount.address.toString(),
      sourceAddress: sourceAccount.toString(),
      decimals,
      adjustedAmount,
    });
  } catch (error) {
    console.error('Error preparing SPL transfer:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: 'Failed to prepare transaction', message: errorMessage },
      { status: 500 }
    );
  }
}
