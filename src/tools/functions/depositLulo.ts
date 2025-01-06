const functionDescription =
  'Call this function ONLY when the user explicitly requests to deposit stable coins into Lulo. Ensure the user specifies the correct stable coin (USDS or USDC) and an amount. DO NOT make assumptions about the coin or the amount if unclear. USDS and USDC are DISTINCT coins—choose appropriately. This function is NOT for withdrawals or any other operation. Confirm the user’s intent before proceeding if you are unsure about it.';

  export const depositLulo = {
    type: 'function',
    name: 'depositLulo',
    description: functionDescription,
    parameters: {
        type: 'object',
        strict: true, // Ensures only defined parameters are accepted
        properties: {
            amount: {
                type: 'number',
                description: 'The amount of stable coin to deposit. Must be a valid positive number.',
            },
            token: {
                type: 'string',
                enum: ['USDS', 'USDC'], // Removed 'USDT' for consistency
                description: 'The stable coin to deposit (either USDS or USDC).',
            },
        },
        required: ['amount', 'token'], // Both parameters are mandatory
    },
};



//TODO: Shift the trigger logic here from conversation.tsx
export function depositLuloFunction() {
  
}
