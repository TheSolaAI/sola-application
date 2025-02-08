const functionDescription =
  'Call this function when the user wants to know the current market data. Do not call this for any price fetching actions.';

export const getMarketData = {
  type: 'function',
  name: 'getMarketData',
  description: functionDescription,
  strict: true,
  parameters: {
    type: 'object',
    properties: {},
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getMarketDataFunction() {}
