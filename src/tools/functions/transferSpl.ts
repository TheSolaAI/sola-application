const functionDescription =
'Call this function when the user wants to send tokens that are not SOLANA or SOL using address or .sol domain. the .sol domains are random and doesnt need to make sense in meaining, so dont autocorrect anything from .sol domains.';

export const transferSpl = {
  type: 'function',
  name: 'transferSpl',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
      amount: {
        type: 'number',
        description: 'Quantity of tokenA to swap.'
      },
      token: {
        type: 'string',
        enum: ['SOLA', 'USDC', 'JUP',"USDT","BONK"],
        description: 'The token that the user wants to send.',
      },
      address: {
        type: 'string',
        description: 'Recipient address or his .sol domain.',
    },
    },
    required: ['quantity', 'token', 'address'],
  },
};