import { SwapParams, SwapResponse } from '../../types/jupiter';
import axios from 'axios';
import { VersionedTransaction } from '@solana/web3.js';

const wallet_service_url = process.env.WALLET_SERVICE_URL;

export async function swapLST(
  params: SwapParams,
): Promise<VersionedTransaction | null> {
  try {
    const response = await axios.post<any>(
      wallet_service_url + 'api/wallet/jup/swap',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const swapTransaction = response.data['transaction'];
    const transactionBuffer = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);
    return transaction;
  } catch (error) {
    console.error('Error during swap:', error);
    return null;
  }
}
