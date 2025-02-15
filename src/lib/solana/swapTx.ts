import { SwapParams, SwapResponse } from '../../types/jupiter';
import { ApiClient, apiClient } from '../../api/ApiClient';
import { VersionedTransaction } from '@solana/web3.js';

const wallet_service_url = process.env.WALLET_SERVICE_URL;

export async function swapTx(
  params: SwapParams,
): Promise<VersionedTransaction | null> {
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
    return transaction;
  } catch (error) {
    console.error('Error during swap:', error);
    return null;
  }
}
