import axios from 'axios';
import { RugCheck } from '../../types/data_types';

//process.env.PROXY_SERVER2_URL || 
const data_service_url = "http://localhost:3001/rug?address="

export async function getRugCheck(token:string): Promise<RugCheck | null> {
  try {
    const response = await axios.get<any>(
      data_service_url + token,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const lst_data: RugCheck = response.data;
    return lst_data;
  } catch (error) {
    console.error('Error fetching lst:', error);
    return null;
  }
}
