const functionDescription =
  'Call this function when the user wants to know the price of a nft by giving the name.';

export const getNFTPrice = {
  type: 'function',
  name: 'getNFTPrice',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
      properties: {
          nft_name: {
        type: 'string',
        description: 'the name of the nft',
          }
      },
    required: ['nft_name'],
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getNFTPriceFunction() {
  
}
