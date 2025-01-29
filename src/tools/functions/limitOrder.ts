const functionDescription =
  'Call this function when the user wants to create a limit order. The user will tell to buy or sell a token at a specific price.';
export const limitOrder = {
    type: 'function',
    name: 'limitOrder',
    description: functionDescription,
    parameters: {
        type: 'object',
        strict: true,
        properties: {
            action: {
                type: 'string',
                enum: ['BUY,SELL'],
                description:
                    'The action to be done, buy or sell.',
            },
            amount: {
                type: 'number',
                description:
                    'The token amount specified by the user',
            },
            token: {
                type: 'string',
                description: 'The token that the user wants to buy or sell.',
            },
            limitPrice:{ 
                type: 'number',
                description: 'The limit price specified by the user',
            }
    },
    required: ['action', 'amount', 'token','limitPrice'], 
  },
};
