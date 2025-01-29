import { LimitOrderParams, LimitOrderResponse } from '../../types/jupiter';
import axios from 'axios';


const wallet_service_url = process.env.WALLET_SERVICE_URL;

export async function limitOrderTx(
  params: LimitOrderParams,
): Promise<LimitOrderResponse | null> {

  try {
    const response = await axios.post<any>(
      wallet_service_url+ "api/wallet/jup/limit-order",
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
      const resp: LimitOrderResponse = response.data
    return resp
  } catch (error) {
    console.error('Error creating limit order:', error);
    return null;
  }
}
