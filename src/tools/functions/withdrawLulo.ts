const functionDescription =
  'Call this function when the user wants to withdraw stable coins from Lulo.';

export const withdrawLulo = {
    type: 'function',
    name: 'withdrawLulo',
    description: functionDescription,
    parameters: {
        type: 'object',
        strict: true,
        properties: {
            amount: {
                type: 'number',
                description: 'Amount of stable coin to withdraw.',
            },
            all: {
                type: 'boolean',
                description: 'If the user wants to withdraw all the stable coins from lulo.',
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
export function withdrawLuloFunction() {
  
}
