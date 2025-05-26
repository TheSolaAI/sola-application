import { NextResponse } from 'next/server';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function GET(req: Request) {
  try {
    // Get the space parameter from the URL
    const { searchParams } = new URL(req.url);
    const space = searchParams.get('space');

    if (!space) {
      return NextResponse.json(
        { error: 'Space parameter is required' },
        { status: 400 }
      );
    }

    // Initialize Solana connection
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );

    try {
      // Calculate rent exemption
      const rentExemption = await connection.getMinimumBalanceForRentExemption(
        parseInt(space)
      );

      // Convert lamports to SOL for easier reading
      const rentExemptionInSol = rentExemption / LAMPORTS_PER_SOL;

      return NextResponse.json({
        rentExemption,
        rentExemptionInSol,
        space: parseInt(space),
      });
    } catch (error) {
      console.error('Error calculating rent exemption:', error);
      return NextResponse.json(
        { error: 'Failed to calculate rent exemption' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in rent exemption route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
