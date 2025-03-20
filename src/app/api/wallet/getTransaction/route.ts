import { Connection, VersionedTransactionResponse } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    });
  }

  const { signature, options = {} } = req.body as GetTransactionRequest;

  if (!signature) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing transaction signature',
    });
  }

  try {
    // Use server-side RPC URL
    const rpc = process.env.SOLANA_RPC_URL;

    if (!rpc) {
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error',
      });
    }

    const connection = new Connection(rpc);

    const txInfo = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    const hasError = txInfo?.meta?.err || !txInfo?.meta;

    return res.status(200).json({
      status: 'success',
      transaction: txInfo,
      error: !!hasError,
    });
  } catch (error: unknown) {
    console.error('Error getting transaction:', error);

    // Proper error handling with TypeScript
    const errorMessage =
      error instanceof Error ? error.message : 'Error getting transaction';

    return res.status(500).json({
      status: 'error',
      message: errorMessage,
    });
  }
}
