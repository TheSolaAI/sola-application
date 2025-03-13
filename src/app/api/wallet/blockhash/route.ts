import { NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';

export async function GET() {
  try {
    const rpc = process.env.SOLANA_RPC_URL;

    if (!rpc) {
      return NextResponse.json(
        { error: 'RPC endpoint not configured' },
        { status: 500 }
      );
    }

    // Create a connection to the Solana network
    const connection = new Connection(rpc);

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash('finalized');

    // Return the blockhash in the response
    return NextResponse.json({
      blockhash,
      lastValidBlockHeight,
    });
  } catch (error) {
    console.error('Error getting latest blockhash:', error);
    return NextResponse.json(
      { error: 'Failed to get latest blockhash' },
      { status: 500 }
    );
  }
}
