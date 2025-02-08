const functionDescription =
  'Creates a limit order to buy or sell a token at a specified price.';

export const limitOrder = {
  type: 'function',
  name: 'limitOrder',
  description: functionDescription,
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['BUY', 'SELL'],
        description: 'Order action: either "BUY" or "SELL".',
      },
      amount: {
        type: 'number',
        description: 'The amount of token that the user wants to buy or sell',
      },
      token: {
        type: 'string',
        description: 'The token that the user wants to buy or sell',
      },
      limitPrice: {
        type: 'number',
        description: 'The limit price specified by the user in usd or dollars',
      },
    },
    required: ['action', 'amount', 'token', 'limitPrice'],
  },
};
