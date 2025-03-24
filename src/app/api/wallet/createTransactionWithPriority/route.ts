import {
  VersionedTransaction,
  PublicKey,
  TransactionMessage,
  ComputeBudgetProgram,
} from '@solana/web3.js';

interface CreateTransactionWithPriorityRequest {
  serializedTransaction: string;
  walletAddress: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateTransactionWithPriorityRequest;
    if (!body.serializedTransaction) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Missing serialized transaction',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!body.walletAddress) {
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
        payerKey: new PublicKey(body.walletAddress),
        recentBlockhash: txn.message.recentBlockhash,
        instructions: [computeUnitLimitIx, computePriceIx, ...txnIx],
      }).compileToV0Message();

      const newTxn = new VersionedTransaction(newMessage);

      return new Response(
        JSON.stringify({
          status: 'success',
          txid: newTxn,
          message: 'Created transaction with priority',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error: any) {
      console.error('Error in version transaction formation:', error);
    }
  } catch (error: unknown) {
    console.error('Error creating transaction with priority:', error);

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
