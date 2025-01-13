const functionDescription =
  'Call this function when the user wants to know whether a token is a rug or a scam. You will be given either the ticker or address of the token, and you respond with the statistics given to you.';

export const getRugCheck = {
  type: 'function',
  name: 'getRugCheck',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
      properties: {
      token: {
        type: 'string',
        description: 'The ticker or address of the token',
      },
    },
    required: ['token'],
},
  
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getRugCheckFunction() {
  
}
