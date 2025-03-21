import { LSTData } from '../../types/data_types';
import { apiClient, ApiClient } from '../../api/ApiClient';

const data_service_url = import.meta.env.VITE_DATA_SERVICE_URL;

export async function getLstDataHandler(): Promise<LSTData[] | null> {
  const resp = await apiClient.get<LSTData[]>(
    data_service_url + 'data/sanctum/top_apy'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getLstData:', resp.errors);
    return null;
  }
  return resp.data;
}
