import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { API_URLS } from '@/config/api_urls';
import { NFTCollection } from '@/types/nft';

const Parameters = z.object({
  nft_name: z.string(),
});

export function createGetNFTPriceTool(context: ToolContext) {
  const getNFTPriceTool: Tool<typeof Parameters, ToolResult> = {
    id: 'nft.get_price' as const,
    description:
      'Get floor price, volume, and marketplace data for NFT collections on Solana. Use this function when users ask about NFT prices, collection stats, floor prices, or trading activity for any Solana NFT collection.',
    parameters: Parameters,
    execute: async (params) => {
      const { nft_name } = params;

      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      try {
        const serverApiClient = createServerApiClient(context.authToken);
        const response = await serverApiClient.get<NFTCollection>(
          `${API_URLS.DATA.NFT.SYMBOL}?nft_symbol=${nft_name.toLowerCase()}`,
          undefined,
          'data'
        );

        if (ApiClient.isApiError(response)) {
          return {
            success: false,
            error: 'Failed to fetch NFT collection data',
            data: undefined,
          };
        }

        const nftData = response.data;

        return {
          success: true,
          data: {
            symbol: nftData.symbol,
            floor_price: nftData.floor_price,
            volume_all: nftData.volume_all,
            avg_price_24hr: nftData.avg_price_24hr,
            listed_count: nftData.listed_count,
          },
          error: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Unable to retrieve NFT collection data',
          data: undefined,
        };
      }
    },
  };

  return getNFTPriceTool;
}
