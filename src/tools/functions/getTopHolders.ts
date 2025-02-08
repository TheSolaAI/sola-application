const functionDescription = `
  This function retrieves the top holders for a token.
`;
export const getTopHolders = {
  type: 'function',
  name: 'getTopHolders',
  description: functionDescription.trim(),
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      tokenInput: {
        type: 'string',
        description: 'The address or symbol of the token',
      },
    },
    required: ['tokenInput'],
  },
};
