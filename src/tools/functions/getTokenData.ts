const functionDescription =
  `Use this function to get the details or price of a token. NOTE: The user must specify the word Token`;

export const getTokenData = {
  type: 'function',
  name: 'getTokenData',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      token_address: {
        type: 'string',
        description: 'The token address or token symbol.',
      },
    },
    required: ['token'],
  },
};