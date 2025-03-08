import { Tool } from '../types/tool.ts';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { useWalletHandler } from '../models/WalletHandler.ts';
import { formatNumber } from '../utils/formatNumber.ts';

const functionDescription =
  'call this function when the user wants to check his wallet balance or want to Fund their wallet';

export const walletActions: Tool = {
  implementation: walletActionsFunction,
  abstraction: {
    type: 'function',
    name: 'walletActions',
    description: functionDescription,
    parameters: {
      type: 'object',
      required: ['action'],
      properties: {
        action: {
          type: 'string',
          description:
            "Action to be performed, can be 'check_balance', 'fund_wallet'",
          enum: ['check_balance', 'fund_wallet'],
        },
      },
    },
  },
};

async function walletActionsFunction(args: {
  action: 'check_balance' | 'fund_wallet';
}): Promise<string> {
  if (args.action === 'check_balance') {
    // set a temporary message that we are fetching wallet assets
    useChatMessageHandler.getState().setCurrentChatItem({
      content: {
        type: 'loader_message',
        text: 'Fetching wallet balance...',
        response_id: 'temp',
        sender: 'system',
      },
      id: 0,
      createdAt: new Date().toISOString(),
    });
    const walletAssets = useWalletHandler.getState().walletAssets;
    const assetDetails = walletAssets.tokens.map((item) => {
      const amount = formatNumber(item.balance);
      return {
        symbol: item.symbol,
        amount: parseFloat(amount),
        price: item.totalPrice,
      };
    });

    const totalAmount = walletAssets.tokens
      .reduce((acc, asset) => acc + (asset.totalPrice || 0), 0)
      .toFixed(2);

    const assetDetailsString = assetDetails
      .filter((asset) => asset.symbol !== 'SOL' && asset.price > 1)
      .map((asset) => `${asset.symbol}: ${asset.amount}`)
      .join(', ');

    const solAsset = assetDetails.find((asset) => asset.symbol === 'SOL');

    return `Your wallet balance is ${solAsset?.amount} SOL and ${totalAmount} USD. Your other assets are ${assetDetailsString}. Humanize this response.`;
  } else if (args.action === 'fund_wallet') {
    return 'Currently in Maintenance. Please try again later.';
  } else {
    // TODO: Re implement Wallet Funding
    return 'Invalid action. Please provide a valid action.';
  }
}
