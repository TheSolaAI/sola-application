import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';

export function createTokenAddressTool(context: ToolContext) {
  const Parameters = z.object({
    token_symbol: z
      .string()
      .describe(
        'The token symbol or name to look up (e.g., "SOL", "BONK", "Solana").'
      ),
  });

  const tokenAddressTool: Tool<typeof Parameters, ToolResult> = {
    id: 'common.tokenAddress' as const,
    description:
      'Get the token address for a given token symbol or token name on the Solana blockchain. This tool is useful when you need a token address but the user only provided a token symbol or name. Do not use this tool for wallet addresses.',
    parameters: Parameters,
    execute: async (params) => {
      try {
        // Validate input
        if (!params.token_symbol) {
          return {
            success: false,
            error: 'Please provide a valid token symbol.',
            data: undefined,
          };
        }

        if (!context.authToken) {
          return {
            success: false,
            error: 'No auth token provided',
            data: undefined,
          };
        }

        // Clean up the token symbol
        const tokenSymbol = params.token_symbol.trim();

        // Add $ prefix if not already present (for the API)
        const apiSymbol = tokenSymbol.startsWith('$')
          ? tokenSymbol
          : `$${tokenSymbol}`;

        // For display, remove $ if present
        const displaySymbol = tokenSymbol.startsWith('$')
          ? tokenSymbol.substring(1)
          : tokenSymbol;

        // First attempt: Try the data service API
        try {
          const response = await fetch(
            `https://data-stream-service.solaai.tech/data/token/token_address?symbol=${apiSymbol}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${context.authToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            return {
              success: true,
              data: {
                type: 'token_address_result',
                symbol: displaySymbol,
                tokenAddress: data.token_address,
                source: 'Data Service',
                success: true,
                response_id: 'temp',
                sender: 'system',
                timestamp: new Date().toISOString(),
              },
              error: undefined,
            };
          }
        } catch (err) {
          console.error('Error with primary token lookup method:', err);
          // Continue to fallback method
        }

        // Fallback: Try DexScreener search
        const tokenAddress = await getTokenAddressFromTicker(displaySymbol);

        if (tokenAddress) {
          return {
            success: true,
            data: {
              type: 'token_address_result',
              symbol: displaySymbol,
              tokenAddress: tokenAddress,
              source: 'DexScreener',
              success: true,
              response_id: 'temp',
              sender: 'system',
              timestamp: new Date().toISOString(),
            },
            error: undefined,
          };
        }

        // If both methods fail
        return {
          success: false,
          error: `Could not find token address for ${displaySymbol}`,
          data: undefined,
        };
      } catch (error) {
        console.error('Error getting token address:', error);
        return {
          success: false,
          error: `Error looking up token address for ${params.token_symbol}`,
          data: undefined,
        };
      }
    },
  };

  return tokenAddressTool;
}

/**
 * Fallback function to get token address from DexScreener
 */
async function getTokenAddressFromTicker(
  ticker: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(ticker)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    // Filter for Solana pairs only and sort by FDV
    let solanaPairs = data.pairs
      .filter((pair: any) => pair.chainId === 'solana')
      .sort((a: any, b: any) => (b.fdv || 0) - (a.fdv || 0));

    solanaPairs = solanaPairs.filter(
      (pair: any) =>
        pair.baseToken.symbol.toLowerCase() === ticker.toLowerCase()
    );

    // Return the address of the highest FDV Solana pair
    return solanaPairs.length > 0 ? solanaPairs[0].baseToken.address : null;
  } catch (error) {
    console.error('Error fetching token address from DexScreener:', error);
    return null;
  }
}
