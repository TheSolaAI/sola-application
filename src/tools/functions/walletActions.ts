const functionDescription =
  'call this function when the user wants to check his wallet balance or want to Fund their wallet';

export const walletActions = {
  type: 'function',
  name: 'walletActions',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    required: ['action'],
    properties: {
      action: {
        type: 'string',
        description:
          "Action to be performed, can be 'check_balance', 'fund_wallet'",
        enum: ['check_balance', 'fund_wallet'],
      },
    },
  },
};
