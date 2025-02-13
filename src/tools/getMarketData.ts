import { Tool } from '../types/tool.ts';

const functionDescription =
  'Call this function when the user wants to know the current market data. Do not call this for any price fetching actions.';

export const getMarketData: Tool = {
  implementation: getMarketDataFunction,
  representation: {
    props_type: 'market_data',
    component: MarketDataMessageItem,
  },
  abstraction: {
    type: 'function',
    name: 'getMarketData',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getMarketDataFunction() {}
