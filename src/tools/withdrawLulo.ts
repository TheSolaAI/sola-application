const functionDescription =
  'Call this function ONLY when the user explicitly requests to withdraw stable coins from Lulo. Ensure the user specifies the correct stable coin (USDS or USDC) and an amount. DO NOT assume or attach any arbitrary number if unclear. USDS and USDC are DISTINCT coins—select appropriately. This function is NOT for deposits or any other operation. Confirm the user’s intent before proceeding if you are unsure of the intent.';

export const withdrawLulo = {
  type: 'function',
  name: 'withdrawLulo',
  description: functionDescription,
  parameters: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount of stable coin to withdraw.',
      },
      all: {
        type: 'boolean',
        description:
          'If the user wants to withdraw all the stable coin of type token from lulo.',
      },
      token: {
        type: 'string',
        enum: ['USDT', 'USDS', 'USDC'],
        description: 'The stable coin that the user wants to withdraw.',
      },
    },
    required: ['token'],
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function withdrawLuloFunction() {}
