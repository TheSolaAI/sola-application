const functionDescription = `Fetches a bubblemap for the specified token.`;

export const getBubblemap = {
  type: 'function',
  name: 'getBubblemap',
  description: functionDescription,
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'This is the token address or symbol.',
      },
    },
    required: ['token'],
  },
};
