'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ToolResult } from '@/types/tool';
import { TokenAddressResultItem } from '@/components/messages/TokenAddressResultItem';
import { useUserHandler } from '@/store/UserHandler';

/**
 * Implementation function for the getTokenAddress tool
 * Retrieves a token address from a symbol or name
 */
async function getTokenAddressFunction(
  args: { token_symbol: string },
  response_id: string
): Promise<ToolResult<'token_address_result'>> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Token Analyst: Looking up token address for ${args.token_symbol}...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    // Validate input
    if (!args.token_symbol) {
      return {
        status: 'error',
        response: 'Please provide a valid token symbol.',
        props: {
          type: 'token_address_result',
          response_id,
          sender: 'system',
          symbol: '',
          tokenAddress: '',
          success: false,
          errorMessage: 'Invalid token symbol provided',
        },
      };
    }

    // Clean up the token symbol
    const tokenSymbol = args.token_symbol.trim();

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
      const token = useUserHandler.getState().authToken;

      const response = await fetch(
        `https://data-stream-service.solaai.tech/data/token/token_address?symbol=${apiSymbol}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Validate response structure
        if (data && data.token_address) {
          return {
            status: 'success',
            response: `Found token address for ${displaySymbol}: ${data.token_address}`,
            props: {
              type: 'token_address_result',
              response_id,
              sender: 'system',
              symbol: displaySymbol,
              tokenAddress: data.token_address,
              source: 'Data Service',
              success: true,
            },
          };
        }
      }
    } catch (err) {
      console.error('Error with primary token lookup method:', err);
      // Continue to fallback method
    }

    // Fallback: Try DexScreener search
    const tokenAddress = await getTokenAddressFromTicker(displaySymbol);

    if (tokenAddress) {
      return {
        status: 'success',
        response: `Found token address for ${displaySymbol}: ${tokenAddress}`,
        props: {
          type: 'token_address_result',
          response_id,
          sender: 'system',
          symbol: displaySymbol,
          tokenAddress: tokenAddress,
          source: 'DexScreener',
          success: true,
        },
      };
    }

    // If both methods fail
    return {
      status: 'error',
      response: `Could not find token address for ${displaySymbol}. Ask the user to try for different token.`,
      props: {
        type: 'token_address_result',
        response_id,
        sender: 'system',
        symbol: displaySymbol,
        tokenAddress: '',
        success: false,
        errorMessage: 'Token not found on Solana chain',
      },
    };
  } catch (error) {
    console.error('Error getting token address:', error);
    return {
      status: 'error',
      response: `Error looking up token address for ${args.token_symbol}. Please try again.`,
      props: {
        type: 'token_address_result',
        response_id,
        sender: 'system',
        symbol: args.token_symbol,
        tokenAddress: '',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
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
      throw new Error(`DexScreener API returned ${response.status}`);
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

// Register the tool using the registry
export const tokenAddress = registerTool({
  name: 'TokenAddress',
  description:
    'Get the token address for a given token symbol or name on the Solana blockchain. This tool is useful when you need a token address but the user only provided a token symbol or name.',
  propsType: 'token_address_result',
  cost: 0.00001,
  implementation: getTokenAddressFunction,
  component: TokenAddressResultItem,
  customParameters: {
    type: 'object',
    properties: {
      token_symbol: {
        type: 'string',
        description:
          'The token symbol or name to look up (e.g., "SOL", "BONK", "Solana").',
      },
    },
    required: ['token_symbol'],
  },
});
