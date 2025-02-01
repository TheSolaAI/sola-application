const functionDescription =
  'Call this function when the user wants to swap his sol to an lst.';

export const swapLST = {
  type: 'function',
  name: 'swapLST',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      quantity: {
        type: 'number',
        description: 'Quantity of solana to swap.',
      },
      lst: {
        type: 'string',
        description: 'The LST to swap',
      },
    },
    required: ['quantity', 'lst'],
  },
};
