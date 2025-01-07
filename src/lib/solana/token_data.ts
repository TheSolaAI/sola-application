import axios from 'axios';
import { TokenData } from '../../types/token_data';

const data_service_url = import.meta.env.DATA_SERVICE_URL;

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
