const functionDescription =
  'Call this function when the user wants to swap tokens. The swap can be based on a specific amount of tokenA (interpreted as a dollar amount or token quantity), or to receive a specified amount of tokenB.';

export const swapTokens = {
  type: 'function',
  name: 'swapTokens',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      swapType: {
        type: 'string',
        enum: ['EXACT_IN', 'EXACT_OUT', 'EXACT_DOLLAR'], 
        description:
          'The type of swap: EXACT_IN specifies the number of token a to be swapped, EXACT_OUT specifies the number of token b to be received, and EXACT_DOLLAR specifies the dollar amount to be swapped.',
      },
      quantity: {
        type: 'number',
        description:
          'The amount for the swap. This can represent a token quantity (if swapType is TOKEN_TO_TOKEN or TOKEN_TO_DOLLAR) or a dollar amount (if swapType is DOLLAR_TO_TOKEN).',
      },
      tokenA: {
        type: 'string',
        enum: ['SOL', 'SOLA', 'USDC', 'JUP', 'USDT', 'BONK'],
        description: 'The token that the user wants to swap.',
      },
      tokenB: {
        type: 'string',
        enum: ['SOL', 'SOLA', 'USDC', 'JUP', 'USDT', 'BONK'],
        description: 'The token that the user wants to receive.',
      },
    },
    required: ['swapType', 'amount', 'tokenA', 'tokenB'], // All swaps require these fields
  },
};
