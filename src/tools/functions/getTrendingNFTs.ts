const functionDescription =
  'Call this function when the user wants to get the trending solana nfts.';

export const getTrendingNFTs = {
  type: 'function',
  name: 'getTrendingNFTs',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {},
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getTrendingNFTsFunction() {}
