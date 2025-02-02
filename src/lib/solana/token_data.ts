import { TokenData } from '../../types/token_data';
import ApiClient from '../../api/ApiClient';
const data_service_url = process.env.DATA_SERVICE_URL;

export async function getTokenData(address: string): Promise<TokenData | null> {
  const resp = await ApiClient.get<TokenData>(
    data_service_url + 'api/data/token?token_address=' + address,
  );
  return resp;
}
export async function getTokenDataSymbol(
  symbol: string,
): Promise<TokenData | null> {
  const token_data = await ApiClient.get<any>(
    data_service_url + 'data/token/symbol?symbol=' + symbol,
  );
  if (!token_data) {
    return null;
  }
  const token_card: TokenData = {
    image: token_data.image,
    marketcap: token_data.marketcap,
    metadata: {
      name: token_data.name,
      symbol: token_data.symbol,
      description: token_data.token_address,
      token_standard: token_data.url,
    },
    price: token_data.price,
    volume: token_data.volume,
    price_change_24: token_data.price_change_24,
  };
  return token_card;
}
