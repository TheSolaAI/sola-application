import { Tool } from '../types/tool.ts';

const functionDescription = `Fetches a bubblemap for the specified token.`;

export const getBubblemap: Tool = {
  implementation: getBubblemapFunction,
  abstraction: {
    type: 'function',
    name: 'getBubblemap',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'This is the token address or symbol.',
        },
      },
      required: ['token'],
    },
  },
};

export function getBubblemapFunction() {}
