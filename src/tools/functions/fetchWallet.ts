const functionDescription =
  'Call this function when the user wants fetch or view their wallet. Read out the assets from the wallet. It will be given to you in a string. Do not stop till u completely tell them their wallet details';

export const fetchWallet = {
  type: 'function',
  name: 'fetchWallet',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {},
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getLuloAssetsFunction() {
  
}
