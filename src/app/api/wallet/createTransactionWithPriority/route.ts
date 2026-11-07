import {
  addPriorityFeeToSerializedTransaction,
  estimatePriorityFee,
  PriorityFeeLevel,
  PriorityFeeOptions,
  resolvePriorityFeeMicroLamports,
} from '@/utils/priorityFee';

interface CreateTransactionWithPriorityRequest {
  serializedTransaction: string;
  walletAddress: string;
  priorityLevel?: PriorityFeeLevel;
  customPriorityFee?: number;
  computeUnitLimit?: number;
  useDynamicEstimate?: boolean;
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

    let feeOptions: PriorityFeeOptions = {
      level: body.priorityLevel,
      customFee: body.customPriorityFee,
      computeUnitLimit: body.computeUnitLimit,
    };

    // If dynamic fee estimation is requested, attempt to estimate via RPC
    if (body.useDynamicEstimate && body.customPriorityFee === undefined) {
      try {
        const estimatedFee = await estimatePriorityFee(body.serializedTransaction);
        feeOptions = {
          ...feeOptions,
          level: 'custom',
          customFee: estimatedFee,
        };
      } catch (err) {
        console.warn(
          'Dynamic priority fee estimation failed, falling back to configured level:',
          err
        );
      }
    }

    const result = addPriorityFeeToSerializedTransaction(
      body.serializedTransaction,
      body.walletAddress,
      feeOptions
    );

    return new Response(
      JSON.stringify({
        status: 'success',
        serializedTransaction: result.serializedTransaction,
        txid: result.serializedTransaction,
        microLamports: result.microLamports,
        computeUnitLimit: result.computeUnitLimit,
        message: 'Created transaction with priority',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error creating transaction with priority:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Error creating transaction with priority';

    return new Response(
      JSON.stringify({ status: 'error', message: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
