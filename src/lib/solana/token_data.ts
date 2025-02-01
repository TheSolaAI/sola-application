import axios from 'axios';
import { TokenData } from '../../types/token_data';

const data_service_url = process.env.DATA_SERVICE_URL;

export async function getTokenData(params: string): Promise<TokenData | null> {
  try {
    const response = await axios.post<any>(
      data_service_url + 'data/token/address',
      { token_address: params },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const token_data: TokenData = response.data;
    return token_data;
  } catch (error) {
    console.error('Error fetching assets:', error);
    return null;
  }
}

export async function getTokenDataSymbol(
  params: string,
): Promise<TokenData | null> {
  try {
    const response = await axios.post<any>(
      data_service_url + 'data/token/symbol',
      { symbol: params },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const token_data = response.data;
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
  } catch (error) {
    console.error('Error fetching assets:', error);
    return null;
  }
}
