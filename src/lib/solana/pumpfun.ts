'use client';

import { apiClient, ApiClient } from '@/lib/ApiClient';
import {
  PfBuyParams,
  PfBuyResponse,
  PfSellParams,
  PfSellResponse,
} from '@/types/pumpfun';

export async function pfBuyTx(
  params: PfBuyParams
): Promise<PfBuyResponse | null> {
  const resp = await apiClient.post<PfBuyResponse>(
    'api/wallet/pf/buy',
    params,
    'wallet'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error buying token:', resp.errors);
    return null;
  }
  return resp.data;
}

export async function pfSellTx(
  params: PfSellParams
): Promise<PfSellResponse | null> {
  const resp = await apiClient.post<PfSellResponse>(
    'api/wallet/pf/sell',
    params,
    'wallet'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error selling tokens:', resp.errors);
    return null;
  }
  return resp.data;
}
