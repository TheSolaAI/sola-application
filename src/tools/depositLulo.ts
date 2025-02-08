const functionDescription =
  'Call this function ONLY when the user explicitly requests to deposit stable coins into Lulo. Ensure the user specifies the correct stable coin (USDS or USDC) and an amount. DO NOT make assumptions about the coin or the amount if unclear. USDS and USDC are DISTINCT coins—choose appropriately. This function is NOT for withdrawals or any other operation. Confirm the user’s intent before proceeding if you are unsure about it.';

export const depositLulo = {
  type: 'function',
  name: 'depositLulo',
  description: functionDescription,
  strict: true,
  parameters: {
    type: 'object',
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
