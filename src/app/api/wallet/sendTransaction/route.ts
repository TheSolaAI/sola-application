// pages/api/send-transaction.ts
import { Connection, SendOptions } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

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

// request body type
interface SendTransactionRequest {
  serializedTransaction: string;
  options?: SendOptions;
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

  const { serializedTransaction, options = {} } =
    req.body as SendTransactionRequest;

  if (!serializedTransaction) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing serialized transaction',
    });
  }

  try {
    const rpc = process.env.SOLANA_RPC_URL;

    if (!rpc) {
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error',
      });
    }

    const connection = new Connection(rpc);

    // Send the transaction
    const txid = await connection.sendRawTransaction(
      Buffer.from(serializedTransaction, 'base64'),
      options
    );

    return res.status(200).json({
      status: 'success',
      txid,
      message: 'Transaction sent successfully',
    });
  } catch (error: unknown) {
    console.error('Error sending transaction:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error sending transaction';

    return res.status(500).json({
      status: 'error',
      message: errorMessage,
    });
  }
}
