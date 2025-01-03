import { SwapParams, SwapResponse } from '../../types/swap';
import axios from 'axios';
import { VersionedTransaction } from '@solana/web3.js';

export async function swapTx(
  params: SwapParams,
): Promise<VersionedTransaction | null> {
  try {
    const response = await axios.post<any>(
      process.env.WALLET_SERVICE_URL +'/api/swap',
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
