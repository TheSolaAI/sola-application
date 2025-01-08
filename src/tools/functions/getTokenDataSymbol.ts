const functionDescription =
  'Call this function when the user wants to obatin the data of a token by giving the token symbol prefixed with $. You have to include the $ in the output argument.';

export const getTokenDataSymbol = {
  type: 'function',
  name: 'getTokenDataSymbol',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      symbol: {
        type: 'string',
        description: 'the symbol of a token prefixed with $'
      },
    },
    required: ['symbol'],
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getTokenDataSymbolFunction() {

}
