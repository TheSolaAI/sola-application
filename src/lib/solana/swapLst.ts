import { SwapParams, SwapResponse } from '../../types/jupiter';
import ApiClient from '../../api/ApiClient';
import { VersionedTransaction } from '@solana/web3.js';

const wallet_service_url = import.meta.env.VITE_WALLET_SERVICE_URL;

export async function swapLST(
  params: SwapParams
): Promise<VersionedTransaction | null> {
  const response = await ApiClient.post<SwapResponse>(
    wallet_service_url + 'api/wallet/jup/swap',
    params
  );
  if (!response) {
    return null;
  }
  try {
    const swapTransaction = response.transaction;
    const transactionBuffer = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);
    return transaction;
  } catch (error) {
    console.error('Error during swap:', error);
    return null;
  }
}
