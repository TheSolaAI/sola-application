import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { TokenDataResponse } from '../types/response.ts';
import { TokenDataMessageItem } from '../components/messages/TokenDataMessageItem.tsx';
import { TokenDataChatContent } from '../types/chatItem.ts';

const functionDescription = `Get the current price of any token in Solana Blockchain, including detailed information like buy/sell prices, Market Cap, Top Holders, Bubblemaps and Token Analysis.`;

export const getTokenData: Tool = {
  cost: 0.00001,
  implementation: getTokenDataFunction,
  representation: {
    props_type: 'token_data',
    component: TokenDataMessageItem,
  },
  abstraction: {
    type: 'function',
    name: 'getTokenData',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        token_address: {
          type: 'string',
          description:
            'The exact token contract address, symbol, or name. For symbols or names, provide ONLY the raw text (e.g., "SOL", "JUP", "BONK") without any additions like "address", "token", or other modifiers.',
        },
      },
      required: ['token_address'],
    },
  },
};

async function getTokenDataFunction(
  args: { token_address: string },
  response_id: string,
): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: TokenDataChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: 'Token Analyst agent: Fetching token data...',
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  const isAddress = args.token_address.length > 35;
  const url = isAddress
    ? '/data/token/address?token_address=' + args.token_address
    : '/data/token/symbol?symbol=$' + args.token_address;

  // Fetch token data
  try {
    const response = await apiClient.get<TokenDataResponse>(
      url,
      undefined,
      'data',
    );

    if (ApiClient.isApiResponse<TokenDataResponse>(response)) {
      // Construct UI props
      const uiProps: TokenDataChatContent = {
        response_id,
        sender: 'assistant',
        type: 'token_data',
        data: response.data,
      };

      // Construct response message
      const responseMessage = `${response.data.name} (${response.data.symbol}): $${response.data.price.toFixed(6)}, MC: $${response.data.marketCap.toLocaleString()}, FDV: $${response.data.fdv.toLocaleString()}, Liq: $${response.data.liquidity.toLocaleString()}, 24h: ${response.data.priceChange24hPercent.toFixed(2)}%, 4h: ${response.data.priceChange4hPercent.toFixed(2)}%, 1h: ${response.data.priceChange1hPercent.toFixed(2)}%, Buy 24h: $${response.data.vBuy24hUSD.toLocaleString()}, Sell 24h: $${response.data.vSell24hUSD.toLocaleString()}, Wallets: ${response.data.uniqueWallet24h.toLocaleString()}, Holders: ${response.data.holder.toLocaleString()}, Addr: ${response.data.address}`;

      return {
        status: 'success',
        response: responseMessage,
        props: uiProps,
      };
    } else {
      return {
        status: 'error',
        response: 'An error occurred while fetching token data',
      };
    }
  } catch (e) {
    console.error('error while fetching token data', e);
    return {
      status: 'error',
      response: 'An error occurred while fetching token data',
    };
  }
}
