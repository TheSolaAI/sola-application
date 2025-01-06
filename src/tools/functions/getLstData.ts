const functionDescription =
  'Call this function when the user wants to know the highest apy in LST (Liquid Staking Token). General questions would be what is the best lst to stake? etc';

export const getLstData = {
  type: 'function',
  name: 'getLstData',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {},
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getLstDataFunction() {
  
}
