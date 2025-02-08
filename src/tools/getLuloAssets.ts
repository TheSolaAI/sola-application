const functionDescription =
  'Call this function when the user wants view their Lulo assets.';

export const getLuloAssets = {
  type: 'function',
  name: 'getLuloAssets',
  description: functionDescription,
  strict: true,
  parameters: {
    type: 'object',
    properties: {},
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getLuloAssetsFunction() {}
