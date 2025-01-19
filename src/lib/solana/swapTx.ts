import { SwapParams, SwapResponse } from '../../types/swap';
import axios from 'axios';
import { VersionedTransaction } from '@solana/web3.js';

const wallet_service_url =
  process.env.WALLET_SERVICE_URL || 'http://0.0.0.0:8000/';
// const wallet_service_url = "http://0.0.0.0:8000/"

export async function swapTx(
  params: SwapParams,
): Promise<VersionedTransaction | null> {
  console.log('params', params);
  // console.log('wallet_service_url', wallet_service_url);
  console.log('params', params);
  // console.log('wallet_service_url', wallet_service_url);
  try {
    const response = await axios.post<any>(
      wallet_service_url+ "api/wallet/jup/swap",
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
