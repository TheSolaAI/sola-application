import { LimitOrderParams, LimitOrderResponse, ShowLimitOrderParams, ShowLimitOrderResponse } from '../../types/jupiter';
import axios from 'axios';


const wallet_service_url = process.env.WALLET_SERVICE_URL;

export async function limitOrderTx(
  params: LimitOrderParams,
): Promise<LimitOrderResponse | null> {

  try {
    const response = await axios.post<any>(
      wallet_service_url+ "api/wallet/jup/limit-order/create",
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

export async function getLimitOrders(
  publicKey: string,
): Promise<ShowLimitOrderResponse | null> {
  try {
    const response = await axios.get<any>(
      wallet_service_url + 'api/wallet/jup/limit-order/show',
      {
        params: {
          address: publicKey,
        },
      },
    );
    const resp:ShowLimitOrderResponse = response.data;
    return resp;
  } catch (error) {
    console.error('Error fetching limit order:', error);
    return null;
  }
}
