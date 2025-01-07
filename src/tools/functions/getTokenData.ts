const functionDescription =
  'Call this function when the user wants to obatin the data of a token by giving the token address.';

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
        description: 'the contract address of a token'
      },
    },
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getTokenDataFunction() {
  
}
