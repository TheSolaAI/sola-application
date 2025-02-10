import { Tool } from '../types/tool.ts';

const functionDescription = `
  This function retrieves the top holders for a token.
`;
export const getTopHolders: Tool = {
  implementation: getTopHoldersFunction,
  abstraction: {
    type: 'function',
    name: 'getTopHolders',
    description: functionDescription.trim(),
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
  },
};

export function getTopHoldersFunction() {}
