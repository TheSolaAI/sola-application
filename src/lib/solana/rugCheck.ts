import { ApiClient } from '../../api/ApiClient';
import { RugCheck } from '../../types/data_types';

const data_service_url = import.meta.env.VITE_DATA_SERVICE_URL;

export async function getRugCheck(token: string): Promise<RugCheck | null> {
  const resp = await ApiClient.get<RugCheck>(
    data_service_url + 'data/token/rug_check?token=' + token,
  );
  return resp;
}
