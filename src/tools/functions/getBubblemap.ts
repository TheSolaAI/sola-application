const functionDescription = 
  `Fetches a bubblemap for the specified token. This can be used to retrieve additional details about a token when required. 
  The input can be either a token address or a token symbol. If it is a symbol, make sure to prefix it with "$".
  `;

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
        description: 'The token address or symbol to retrieve the bubblemap for. If it is a symbol, prefix it with "$".',
      },
    },
    required: ['token'],
  },
};
