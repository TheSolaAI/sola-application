const functionDescription =
  'Call this function when the user wants to open or close his wallet.';

export const toggleWallet = {
  type: 'function',
  name: 'toggleWallet',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      action: {
        type: 'string',
        enum: ['open', 'close'],
        description: 'The wallet action that the user wants to perform.',
      },
    },
    required: ['action'],
  },
};

//TODO: Shift the logic here from conversation.tsx
export function toggleWalletFunction({ action }: { action: 'open' | 'close' }) {
  if (action === 'open') {
    console.log('Opening the wallet...');
  } else if (action === 'close') {
    console.log('Closing the wallet...');
  } else {
    console.error('Invalid action provided.');
  }
}