const functionDescription = 
  'Fetches a bubblemap for the specified token address. This can be used to retrieve additional details about a token.';

export const getBubblemap = {
  type: 'function',
  name: 'getBubblemap',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      symbol: {
        type: 'string',
        description: 'The symbol or address of the token to retrieve the bubblemap for.',
      },
    },
    required: ['symbol'],
  },
};
