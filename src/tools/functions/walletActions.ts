export const walletManagement = {
  type: 'function',
  function: {
    name: 'wallet_management',
    description:
      "Manage user's wallet including balance inquiry, funding, and private key export.",
    strict: true,
    parameters: {
      type: 'object',
      required: ['action'],
      properties: {
        action: {
          type: 'string',
          description:
            "Action to be performed, can be 'check_balance', 'fund_wallet', or 'export_key'",
          enum: ['check_balance', 'fund_wallet', 'export_key'],
        },
      },
      additionalProperties: false,
    },
  },
};
