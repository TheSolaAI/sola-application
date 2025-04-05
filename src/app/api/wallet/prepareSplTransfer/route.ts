import { NextResponse } from 'next/server';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

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

    // Get RPC URL from environment or use default
    const rpc =
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

    console.log('Using RPC URL:', rpc);

    // Create connection with better options
    const connection = new Connection(rpc, {
      commitment: 'confirmed',
      disableRetryOnRateLimit: false,
    });

    // Convert addresses to PublicKeys with error handling
    let senderPubkey: PublicKey;
    let recipientPubkey: PublicKey;
    let mintPubkey: PublicKey;

    try {
      senderPubkey = new PublicKey(senderAddress);
      recipientPubkey = new PublicKey(recipientAddress);
      mintPubkey = new PublicKey(tokenMint);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid public key format' },
        { status: 400 }
      );
    }

    // Get token info and decimals
    let decimals: number;
    let tokenSymbol: string | null = null;
    let tokenName: string | null = null;

    try {
      const info = await connection.getParsedAccountInfo(mintPubkey);

      if (!info.value) {
        return NextResponse.json({ error: 'Token not found' }, { status: 404 });
      }

      const parsedData = info.value.data as ParsedAccountData;
      decimals = parsedData.parsed.info.decimals;

      // Get additional token info if available
      tokenSymbol = parsedData.parsed.info.symbol || null;
      tokenName = parsedData.parsed.info.name || null;
    } catch (err) {
      console.error('Error fetching token info:', err);
      return NextResponse.json(
        { error: 'Failed to get token information', details: String(err) },
        { status: 500 }
      );
    }

    // Get source token account
    const sourceAccount = await getAssociatedTokenAddress(
      mintPubkey,
      senderPubkey
    );

    // Calculate adjusted amount with proper rounding
    const adjustedAmount = Math.floor(amount * Math.pow(10, decimals));

    // Create new transaction
    const transaction = new Transaction();

    // Get destination token account address
    const destinationAccount = await getAssociatedTokenAddress(
      mintPubkey,
      recipientPubkey
    );

    // Check if destination token account exists
    let destinationAccountExists = false;
    try {
      await getAccount(connection, destinationAccount);
      destinationAccountExists = true;
    } catch (err) {
      // Account doesn't exist, we need to create it
      destinationAccountExists = false;
    }

    // If the account doesn't exist, add instruction to create it
    if (!destinationAccountExists) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPubkey, // Payer (user will pay, not server)
          destinationAccount,
          recipientPubkey,
          mintPubkey
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        sourceAccount,
        destinationAccount,
        senderPubkey,
        adjustedAmount
      )
    );

    // Get a recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPubkey;

    // Serialize the transaction
    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString('base64');

    // Return the serialized transaction with token details
    return NextResponse.json({
      serializedTransaction,
      tokenDetails: {
        symbol: tokenSymbol,
        name: tokenName,
        decimals,
        address: tokenMint,
      },
      destinationAddress: destinationAccount.toString(),
      sourceAddress: sourceAccount.toString(),
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
