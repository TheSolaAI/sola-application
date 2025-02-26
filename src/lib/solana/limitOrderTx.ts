import {
  LimitOrderParams,
  LimitOrderResponse,
  ShowLimitOrderParams,
  ShowLimitOrderResponse,
} from '../../types/jupiter';
import { apiClient, ApiClient } from '../../api/ApiClient';

const wallet_service_url = import.meta.env.VITE_WALLET_SERVICE_URL;

export async function limitOrderTx(
  params: LimitOrderParams,
): Promise<LimitOrderResponse | null> {
  let resp = await apiClient.post<LimitOrderResponse>(
    wallet_service_url + 'api/wallet/jup/limit-order/create',
    params,
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getAssetsLulo:', resp.errors);
    return null;
  }
  console.log(resp)
  return resp.data;
}

export async function getLimitOrderHandler(
  params: ShowLimitOrderParams,
): Promise<ShowLimitOrderResponse | null> {
  let resp = await apiClient.get<ShowLimitOrderResponse>(
    wallet_service_url +
      'api/wallet/jup/limit-order/show?address=' +
      params.public_key,
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getAssetsLulo:', resp.errors);
    return null;
  }
  return resp.data;
}
