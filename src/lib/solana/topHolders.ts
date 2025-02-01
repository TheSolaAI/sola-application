import ApiClient from '../../api/ApiClient';
import { TopHolder } from '../../types/messageCard';
const data_service_url = process.env.DATA_SERVICE_URL;
export async function getTopHolders(
  token: string,
): Promise<TopHolder[] | null> {
  const resp = await ApiClient.get<TopHolder[]>(
    data_service_url + 'api/data/token/top_holders?token=' + token,
  );
  return resp;
}