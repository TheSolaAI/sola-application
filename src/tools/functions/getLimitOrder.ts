const functionDescription =
  'Call this function when the user wants view their open limit orders.';

export const getLimitOrders = {
  type: 'function',
  name: 'getLimitOrders',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {},
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getLimitOrderFunction() {
  
}
