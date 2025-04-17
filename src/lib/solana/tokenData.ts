import { apiClient, ApiClient } from '../../api/ApiClient';
import { TokenData } from '../../types/data_types';

export async function getTokenData(address: string): Promise<TokenData | null> {
  const resp = await apiClient.get<TokenData>(
    '/data/token/address?token_address=' + address,
    undefined,
    'data'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getTokenData:', resp.errors);
    return null;
  }
  return resp.data;
}
export async function getTokenDataSymbol(
  symbol: string
): Promise<TokenData | null> {
  const resp = await apiClient.get<TokenData>(
    '/data/token/symbol?symbol=' + symbol,
    undefined,
    'data'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getTokenData:', resp.errors);
    return null;
  }
  return resp.data;
}
