import { Connection, SendOptions } from '@solana/web3.js';

// Define response data types
type ErrorResponse = {
  status: 'error';
  message: string;
};

type SuccessResponse = {
  status: 'success';
  txid: string;
  message: string;
};

type ApiResponse = ErrorResponse | SuccessResponse;

// Define request body type
interface SendTransactionRequest {
  serializedTransaction: string;
  options?: SendOptions;
}

// Correct Next.js App Router API format
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendTransactionRequest;

    if (!body.serializedTransaction) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Missing serialized transaction',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    // Send the transaction
    const txid = await connection.sendRawTransaction(
      Buffer.from(body.serializedTransaction, 'base64'),
      body.options || {}
    );

    return new Response(
      JSON.stringify({
        status: 'success',
        txid,
        message: 'Transaction sent successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error sending transaction:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error sending transaction';

    return new Response(
      JSON.stringify({ status: 'error', message: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
