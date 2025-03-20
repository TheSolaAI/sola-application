import { NextResponse } from 'next/server';
import { Connection, SendOptions } from '@solana/web3.js';

interface SendTransactionRequest {
  serializedTransaction: string;
  options?: SendOptions;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = (await req.json()) as SendTransactionRequest;
    const { serializedTransaction, options = {} } = body;

    // Validate the request
    if (!serializedTransaction) {
      return NextResponse.json(
        { error: 'Missing serialized transaction' },
        { status: 400 }
      );
    }

    const rpc = process.env.SOLANA_RPC_URL;

    if (!rpc) {
      return NextResponse.json(
        { error: 'RPC endpoint not configured' },
        { status: 500 }
      );
    }

    const connection = new Connection(rpc);

    // Send the transaction
    const txid = await connection.sendRawTransaction(
      Buffer.from(serializedTransaction, 'base64'),
      options
    );

    // Return the transaction ID
    return NextResponse.json({
      txid,
      message: 'Transaction sent successfully',
    });
  } catch (error) {
    console.error('Error sending transaction:', error);

    // Return the error message for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: 'Failed to send transaction', message: errorMessage },
      { status: 500 }
    );
  }
}
