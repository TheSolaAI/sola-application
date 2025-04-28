import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { API_URLS } from '@/config/api_urls';
import { TrendingNFT } from '@/types/nft';

const Parameters = z.object({});

export function createGetTrendingNFTsTool(context: ToolContext) {
  const getTrendingNFTsTool: Tool<typeof Parameters, ToolResult> = {
    id: 'nft.get_trending' as const,
    description:
      'Retrieves the currently trending NFT collections on Solana. Use when the user wants to know what NFTs are currently popular or trending.',
    parameters: Parameters,
    execute: async () => {
      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      try {
        const serverApiClient = createServerApiClient(context.authToken);
        const response = await serverApiClient.get<TrendingNFT[]>(
          API_URLS.DATA.NFT.TOP_NFT,
          undefined,
          'data'
        );

        if (ApiClient.isApiError(response)) {
          return {
            success: false,
            error: 'Failed to fetch trending NFT collections',
            data: undefined,
          };
        }

        const trendingNFTs = response.data;

        return {
          success: true,
          data: {
            type: 'get_trending_nfts',
            details: {
              collections: trendingNFTs.map((nft) => ({
                name: nft.name,
                symbol: nft.image,
                floor_price: nft.floor_price,
                volume_24hr: nft.volume_24hr,
              })),
            },
            response_id: 'temp',
            sender: 'system',
            timestamp: new Date().toISOString(),
          },
          error: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Unable to retrieve trending NFT collections',
          data: undefined,
        };
      }
    },
  };

  return getTrendingNFTsTool;
}
