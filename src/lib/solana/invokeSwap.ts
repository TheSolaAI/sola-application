import { SwapParams, SwapResponse } from '../../types/swap';
import axios from 'axios';
import { VersionedTransaction } from '@solana/web3.js';
import { tokenList } from '../../store/tokens/tokenMapping';

const wallet_service_url = process.env.WALLET_SERVICE_URL;

export async function swapTx(
    amount: string,
    address: string,
    publicKey:string
): Promise<VersionedTransaction | null> {

    let fin_amount = Number(amount)
    let params: SwapParams = {
        input_mint: tokenList.SOL.MINT,
        output_mint: address,
        public_key: publicKey,
        amount: fin_amount,
    }
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
