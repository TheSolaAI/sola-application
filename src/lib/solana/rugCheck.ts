import { apiClient, ApiClient } from '@/lib/ApiClient';
import { RugCheck } from '@/types/data_types';

export async function getRugCheckHandler(
  token: string
): Promise<RugCheck | null> {
  const resp = await apiClient.get<RugCheck>(
    '/data/token/rug_check?token_address=' + token,
    undefined,
    'data'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getTopHoldersHandler:', resp.errors);
    return null;
  }
  return resp.data;
}
