import { LimitOrderParams, LimitOrderResponse, ShowLimitOrderParams, ShowLimitOrderResponse } from '../../types/jupiter';
import ApiClient from '../../api/ApiClient';


const wallet_service_url = process.env.WALLET_SERVICE_URL;

export async function limitOrderTx(
  params: LimitOrderParams,
): Promise<LimitOrderResponse | null> {

  let resp = await ApiClient.post<LimitOrderResponse>(
    wallet_service_url + 'api/wallet/jup/limit-order/create',
    params,
  );
  return resp;
}

export async function getLimitOrders(
  params:ShowLimitOrderParams,
): Promise<ShowLimitOrderResponse | null> {
  let resp = await ApiClient.get<ShowLimitOrderResponse>(
    wallet_service_url + 'api/wallet/jup/limit-order/show?address=' + params.public_key,
  );
  return resp;
}