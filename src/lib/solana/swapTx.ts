import { SwapParams, SwapResponse } from '@/types/jupiter';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { VersionedTransaction } from '@solana/web3.js';

export async function swapTx(params: SwapParams): Promise<{
  transaction: VersionedTransaction;
  priorityFee: number;
  outAmount: number;
} | null> {
  const response = await apiClient.post<SwapResponse>(
    '/api/wallet/jup/swap',
    params,
    'wallet'
  );

  if (ApiClient.isApiError(response)) {
    throw new Error('Invalid response from API');
    return null;
  }
  try {
    const swapTransaction = response.data.transaction;
    const transactionBuffer = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);
    const priorityFee = response.data.priorityFee;
    const outAmount = response.data.outAmount;
    return {
      transaction: transaction,
      priorityFee: priorityFee,
      outAmount: outAmount,
    };
  } catch (error) {
    console.error('Error during swap:', error);
    return null;
  }
}
