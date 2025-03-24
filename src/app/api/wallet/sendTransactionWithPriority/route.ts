import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import {
  Connection,
  VersionedTransaction,
  PublicKey,
  TransactionMessage,
  ComputeBudgetProgram,
  SendOptions,
} from '@solana/web3.js';

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

interface SendTransactionWithPriorityRequest {
  serializedTransaction: string;
  wallet: ConnectedSolanaWallet;
  options?: SendOptions;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendTransactionWithPriorityRequest;
    if (!body.serializedTransaction) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Missing serialized transaction',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!body.wallet.address) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Missing wallet address',
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
    const fee = await getPriorityFee(body.serializedTransaction);

    try {
      const txnBuffer = Buffer.from(body.serializedTransaction, 'base64');
      const txn = VersionedTransaction.deserialize(txnBuffer);
      const txnIx = TransactionMessage.decompile(txn.message).instructions;

      const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 400_000,
      });

      const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.floor(fee),
      });

      const newMessage = new TransactionMessage({
        payerKey: new PublicKey(body.wallet.address),
        recentBlockhash: txn.message.recentBlockhash,
        instructions: [computeUnitLimitIx, computePriceIx, ...txnIx],
      }).compileToV0Message();

      const newTxn = new VersionedTransaction(newMessage);
      const signed_txn = await body.wallet.signTransaction(newTxn);
      const signature = await connection.sendRawTransaction(
        signed_txn.serialize(),
        body.options || { skipPreflight: false }
      );

      return new Response(
        JSON.stringify({
          status: 'success',
          txid: signature,
          message: 'Transaction sent successfully with priority',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error: any) {
      if (
        error.message?.includes('0x1771') ||
        error.message?.includes('6001')
      ) {
        return new Response(
          JSON.stringify({
            status: 'error',
            message: 'Max Slippage hit',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error('Error sending transaction with priority:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Error sending transaction with priority';

    return new Response(
      JSON.stringify({ status: 'error', message: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function getPriorityFee(transaction: string): Promise<any> {
  const rpc = process.env.SOLANA_RPC_URL;

  const payload = {
    jsonrpc: '2.0',
    id: 'sola-priority-fee',
    method: 'getPriorityFeeEstimate',
    params: [
      {
        transaction: transaction,
        options: {
          recommended: true,
          transactionEncoding: 'base64',
        },
      },
    ],
  };

  try {
    const response = await fetch(rpc!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseJson = await response.json();
    const result = responseJson.result;
    const priorityFee = result.priorityFeeEstimate;
    return priorityFee;
  } catch (error) {
    throw new Error(`Failed to get priority fee: ${error}`);
  }
}
