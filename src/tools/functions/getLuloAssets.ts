const functionDescription =
  'Call this function when the user wants view his Lulo assets.';

export const getLuloAssets = {
  type: 'function',
  name: 'getLuloAssets',
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
