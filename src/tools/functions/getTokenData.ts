const functionDescription =
  `Call this function when the user wants to obatin the data of a token.
  The input must be either a token address (formatted as a Solana Base58 address) or a token symbol. 
  If the input is a token symbol, you must prefix it with "$" before providing it as the argument.`;

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
        description: 'The token address (Solana Base58 format) or token symbol. If it is a symbol, you must prefix it with "$" before passing it.',
      },
    },
    required: ['token'],
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getTokenDataFunction() {
  
}
