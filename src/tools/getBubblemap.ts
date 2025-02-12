import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { Tool } from '../types/tool.ts';
import { getTokenDataSymbol } from '../lib/solana/tokenData.ts';

const functionDescription = `Fetches a bubblemap for the specified token.`;

export const getBubblemap: Tool = {
  implementation: getBubblemapFunction,
  abstraction: {
    type: 'function',
    name: 'getBubblemap',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'This is the token address or symbol.',
        },
      },
      required: ['token'],
    },
  },
};

export async function getBubblemapFunction(args: {
  token: string;
  currentWallet: ConnectedSolanaWallet;
}): Promise<string> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      text: `Fetching bubblemaps for ${args.token}...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  let token = args.token;

  if (token.length !== 44) {
    const formattedToken = token.startsWith('$') ? token : `$${token}`;
    const tokenDetails = await getTokenDataSymbol(formattedToken);

    if (!tokenDetails) {
      return 'Invalid token symbol';
    }

    token = tokenDetails.metadata.address || 'NaN';
  }

  const url = `https://app.bubblemaps.io/sol/token/${token}`;
  console.log(url);
  return url;
}

