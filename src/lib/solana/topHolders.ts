import { ApiClient, apiClient } from '@/lib/ApiClient';
import { TopHolder } from '@/types/messageCard';

interface TopHoldersResponse {
  topHolders: TopHolder[];
}

export async function getTopHoldersHandler(
  token: string
): Promise<TopHolder[] | null> {
  const resp = await apiClient.get<TopHoldersResponse>(
    '/data/token/top_holders?token_address=' + token,
    undefined,
    'data'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getTopHoldersHandler:', resp.errors);
    return null;
  }
  return resp.data.topHolders;
}
