import { Tool } from '../types/tool.ts';

const functionDescription =
  'Call this function when the user wants view their open limit orders.';

export const getLimitOrders: Tool = {
  implementation: getLimitOrderFunction,
  abstraction: {
    type: 'function',
    name: 'getLimitOrders',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getLimitOrderFunction() {}
