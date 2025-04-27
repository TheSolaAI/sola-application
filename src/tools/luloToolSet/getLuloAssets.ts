import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { API_URLS } from '@/config/api_urls';
import { AssetsParams, AssetsResponse } from '@/types/lulo';

const Parameters = z.object({});

export function createGetLuloAssetsTool(context: ToolContext) {
  const getLuloAssetsTool: Tool<typeof Parameters, ToolResult> = {
    id: 'lulo.get_assets' as const,
    description:
      "Retrieves the user's assets, earnings, deposit, and stats from the Lulo platform. Use when the user wants to view their Lulo holdings.",
    parameters: Parameters,
    execute: async () => {
      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      if (!context.publicKey) {
        return {
          success: false,
          error: 'No public key provided',
          data: undefined,
        };
      }

      const assetsParams: AssetsParams = {
        owner: context.publicKey,
      };

      try {
        const assets = await getAssetsLulo(assetsParams, context.authToken);

        if (!assets) {
          return {
            success: false,
            error: 'Failed to retrieve assets from Lulo platform',
            data: undefined,
          };
        }

        return {
          success: true,
          data: {
            type: 'lulo_assets',
            details: {
              depositValue: assets.depositValue,
              interestEarned: assets.interestEarned,
              owner: context.publicKey,
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
          error: 'Unable to retrieve Lulo assets',
          data: undefined,
        };
      }
    },
  };

  return getLuloAssetsTool;
}
async function getAssetsLulo(
  params: AssetsParams,
  authToken: string
): Promise<AssetsResponse | null> {
  const serverApiClient = createServerApiClient(authToken);

  const response = await serverApiClient.get<AssetsResponse>(
    `${API_URLS.WALLET.LULO.ASSETS}?owner=${params.owner}`,
    undefined,
    'wallet'
  );

  if (ApiClient.isApiError(response)) {
    console.error('Error during getAssetsLulo:', response.errors);
    return null;
  }

  return response.data;
}
