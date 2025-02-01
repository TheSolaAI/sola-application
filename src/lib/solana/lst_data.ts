import { LSTData } from '../../types/data_types';
import ApiClient from '../../api/ApiClient';

const data_service_url = process.env.DATA_SERVICE_URL;

export async function getLstData(): Promise<LSTData[] | null> {
  let resp = await ApiClient.get<LSTData[]>(data_service_url + 'data/sanctum/top_apy');
  return resp;
}