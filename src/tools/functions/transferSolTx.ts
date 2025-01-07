const functionDescription =
  'Call this function when the user wants to send SOLANA or SOL.';

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
                description: 'Recipient address.',
            },
        },
        required: ['quantity', 'address'],
    }
};

//TODO: Shift the logic here from conversation.tsx
export function transferSolTxFunction() {
 
}