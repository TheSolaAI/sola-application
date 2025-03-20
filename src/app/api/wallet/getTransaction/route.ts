import { NextRequest } from 'next/server';
import { Connection, VersionedTransactionResponse } from '@solana/web3.js';

// Define response data types
type ErrorResponse = {
  status: 'error';
  message: string;
};

type SuccessResponse = {
  status: 'success';
  transaction: VersionedTransactionResponse | null;
  error: boolean;
};

type ApiResponse = ErrorResponse | SuccessResponse;

// Define request body type
interface GetTransactionRequest {
  signature: string;
  options?: {
    maxSupportedTransactionVersion?: number;
    commitment?: string;
  };
}

// Next.js App Router expects API routes to export a function named `POST`
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GetTransactionRequest;

    if (!body.signature) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Missing transaction signature',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use server-side RPC URL
    const rpc = process.env.SOLANA_RPC_URL;

    if (!rpc) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Server configuration error',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const connection = new Connection(rpc);
    const txInfo = await connection.getTransaction(body.signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    const hasError = txInfo?.meta?.err || !txInfo?.meta;

    return new Response(
      JSON.stringify({
        status: 'success',
        transaction: txInfo,
        error: !!hasError,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error getting transaction:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error getting transaction';

    return new Response(
      JSON.stringify({ status: 'error', message: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
