import axios from 'axios';
import { TopHolder } from '../../types/messageCard';
const data_service_url = process.env.DATA_SERVICE_URL;
export async function getTopHolders(
  token: string,
): Promise<TopHolder[] | null> {
  try {
    const response = await axios.get<any>(
      data_service_url + 'data/token/top_holders?address=' + token,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const topHolders: TopHolder[] = response.data;
    return topHolders;
  } catch (error) {
    console.error('Error fetching Top Holders:', error);
    return null;
  }
}
