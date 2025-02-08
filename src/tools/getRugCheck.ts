const functionDescription =
  'Use this function to check if the token is rug or a scam or to analyse its risk factors.';

export const getRugCheck = {
  type: 'function',
  name: 'getRugCheck',
  description: functionDescription,
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'The name or address of the token',
      },
    },
    required: ['token'],
  },
};
