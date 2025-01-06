const functionDescription =
  'Call this function when the user wants to deposit stable coins to Lulo.';

export const depositLulo = {
  type: 'function',
  name: 'depositLulo',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      amount: {
        type: 'number',
        description: 'Amount of stable coin that the user wants to deoposit.',
      },
      token: {
        type: 'string',
        enum: ['USDT', 'USDS', 'USDC'],
        description: 'The symbol/name of the coin user wants to deposit.',
      },
    },
    required: ['amount', 'token'],
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function depositLuloFunction() {}
