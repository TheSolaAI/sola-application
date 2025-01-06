const functionDescription =
  'Call this function ONLY when the user explicitly requests to withdraw stable coins from Lulo. Ensure the user specifies the correct stable coin (USDS or USDC) and an amount. DO NOT assume or attach any arbitrary number if unclear. USDS and USDC are DISTINCT coins—select appropriately. This function is NOT for deposits or any other operation. Confirm the user’s intent before proceeding if you are unsure of the intent.';

  export const withdrawLulo = {
    type: 'function',
    name: 'withdrawLulo',
    description: functionDescription,
    parameters: {
        type: 'object',
        strict: true, // Ensures only defined parameters are accepted
        properties: {
            amount: {
                type: 'number',
                description: 'The amount of stable coin to withdraw. Must be a valid positive number. Ignored if "all" is true.',
            },
            token: {
                type: 'string',
                enum: ['USDS', 'USDC'], // Removed 'USDT' since it isn't mentioned in the description
                description: 'The stable coin to withdraw (either USDS or USDC).',
            },
        },
        required: ['token'], // Ensure at least the token is mandatory
    },
};



//TODO: Shift the trigger logic here from conversation.tsx
export function withdrawLuloFunction() {
  
}
