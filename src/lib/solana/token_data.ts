import { TokenData } from '../../types/token_data';
import ApiClient from '../../api/ApiClient';
const data_service_url = process.env.DATA_SERVICE_URL;

export async function getTokenData(address: string): Promise<TokenData | null> {
  const resp = await ApiClient.get<TokenData>(
    data_service_url + 'data/token/address?token_address=' + address,
  );
  return resp;
}
export async function getTokenDataSymbol(
  symbol: string,
): Promise<TokenData | null> {
  const resp = await ApiClient.get<TokenData>(
    data_service_url + 'data/token/symbol?symbol=' + symbol,
  );
  return resp;
}
