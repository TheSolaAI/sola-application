const functionDescription =
  'Call this function when the user wants to swap certain amount of one token to another token.';

export const swapTokens = {
  type: 'function',
  name: 'swapTokens',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      quantity: {
        type: 'number',
        description: 'Quantity of tokenA to swap.'
      },
      tokenA: {
        type: 'string',
        //TODO: Use a mapping instead of this.
        enum: ['SOL', 'SOLA', 'USDC', 'JUP',"USDT","BONK"],
        description: 'The token that the user wants to swap.',
      },
      tokenB: {
        type: 'string',
        enum: ['SOL', 'SOLA', 'USDC', 'JUP', 'USDT', 'BONK'],
        description: 'The token that the user want to receive.',
      },
    },
    required: ['quantity', 'tokenA', 'tokenB'],
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function swapTokensFunction() {
  
}
