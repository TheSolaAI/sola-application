import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { XSTOCKS_LIST } from '@/config/tokenMapping';

export function createTokenAddressTool(context: ToolContext) {
  const Parameters = z.object({
    token_symbol: z
      .string()
      .describe(
        'The token or xstocks symbol or name to look up (e.g., "SOL", "BONK", "Solana", "AAPL","xTSLA","Apple stocks")'
      ),
  });

  const tokenAddressTool: Tool<typeof Parameters, ToolResult> = {
    id: 'common.tokenAddress' as const,
    description:
      'Get the token address for a given token symbol or token name on Solana. Supports tokens and xStocks (Apple → xAAPL). Use when only a symbol or name is given, not wallet addresses.',
    parameters: Parameters,

    execute: async (params) => {
      try {
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

        let tokenSymbol = params.token_symbol.trim();
        const lower = tokenSymbol.toLowerCase();
        if (
          lower.includes('stock') ||
          lower.includes('xstock') ||
          XSTOCKS_LIST[lower]
        ) {
          tokenSymbol = normalizeXStockSymbol(tokenSymbol);
        }

        const apiSymbol = tokenSymbol.startsWith('$')
          ? tokenSymbol
          : `$${tokenSymbol}`;
        const displaySymbol = tokenSymbol.startsWith('$')
          ? tokenSymbol.substring(1)
          : tokenSymbol;

        console.log(displaySymbol);

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
        }

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
    let solanaPairs = data.pairs
      .filter((pair: any) => pair.chainId === 'solana')
      .sort((a: any, b: any) => (b.fdv || 0) - (a.fdv || 0));

    solanaPairs = solanaPairs.filter(
      (pair: any) =>
        pair.baseToken.symbol.toLowerCase() === ticker.toLowerCase()
    );
    return solanaPairs.length > 0 ? solanaPairs[0].baseToken.address : null;
  } catch (error) {
    console.error('Error fetching token address from DexScreener:', error);
    return null;
  }
}

function normalizeXStockSymbol(input: string): string {
  if (!input) return input;

  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned
    .replace(/\bxstocks?\b/g, '')
    .replace(/\bstocks?\b/g, '')
    .trim();
  const upper = cleaned.toUpperCase();
  if (/^X[A-Z]{1,6}$/.test(upper)) {
    return upper;
  }
  if (/^[A-Z]{1,6}$/.test(upper)) {
    return `X${upper}`;
  }
  if (XSTOCKS_LIST[cleaned]) {
    return `X${XSTOCKS_LIST[cleaned]}`;
  }
  return input;
}
