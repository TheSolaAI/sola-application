import axios from 'axios';
import { LSTData } from '../../types/data_types';

const data_service_url = import.meta.env.DATA_SERVICE_URL;

export async function getLstData(): Promise<LSTData[] | null> {
  try {
    const response = await axios.get<any>(
      data_service_url + 'data/sanctum/top_apy',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const lst_data: LSTData[] = response.data;
    return lst_data;
  } catch (error) {
    console.error('Error fetching lst:', error);
    return null;
  }
}
