const functionDescription =
  'Call this function when the user wants to send SOLANA or SOL using address or .sol domain. the .sol domains are random and doesnt need to make sense in meaining, so dont autocorrect anything from .sol domains.';

export const transferSolTx = {
  type: 'function',
  name: 'transferSolTx',
  description: functionDescription,
    parameters: {
        type: 'object',
        strict: true,
        properties: {
            quantity: {
                type: 'number',
                description: 'Amount of Solana or SOL to transfer.',
            },
            address: {
                type: 'string',
                description: 'Recipient address or his .sol domain.',
            },
        },
        required: ['quantity', 'address'],
    }
};

//TODO: Shift the logic here from conversation.tsx
export function transferSolTxFunction() {
 
}