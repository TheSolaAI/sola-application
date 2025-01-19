const functionDescription = 
  `Fetches a bubblemap for the specified token.
  The input must be either a token address (formatted as a Solana Base58 address) or a token symbol. 
  If the input is a token symbol, you must prefix it with "$" before providing it as the argument.
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
        description: 'The token address (Solana Base58 format) or token symbol. If it is a symbol, you must prefix it with "$" before passing it.',
      },
    },
    required: ['token'],
  },
};
