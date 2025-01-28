const functionDescription = `Fetches a bubblemap for the specified token.`;

export const getBubblemap = {
  type: 'function',
  name: 'getBubblemap',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      token: {
        type: 'string',
        description:
          'This is the token address or symbol.',
      },
    },
    required: ['token'],
  },
};
