import { TopHolder } from '@/types/messageCard';

interface TopHoldersResponse {
  topHolders: TopHolder[];
}

export async function getTopHoldersHandler(
  token: string,
  authToken: string
): Promise<TopHolder[] | null> {
  try {
    const res = await fetch(
      `https://data-stream-service.solaai.tech/data/token/top_holders?token_address=${token}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      console.error('Failed to fetch top holders:', await res.text());
      return null;
    }

    const json: TopHoldersResponse = await res.json();
    return json.topHolders;
  } catch (error) {
    console.error('Error in getTopHoldersHandler:', error);
    return null;
  }
}
