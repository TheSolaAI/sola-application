import { Tool } from '../types/tool.ts';

const functionDescription =
  'Use this function to check if the token is rug or a scam or to analyse its risk factors.';

export const getRugCheck: Tool = {
  implementation: getRugCheckFunction,
  abstraction: {
    type: 'function',
    name: 'getRugCheck',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'The name or address of the token',
        },
      },
      required: ['token'],
    },
  },
};

export function getRugCheckFunction() {}
