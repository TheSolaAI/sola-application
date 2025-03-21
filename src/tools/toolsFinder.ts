const functionDescription =
  'Get the set of tools required to fulfill users request';

export const getRequiredTools = {
  type: 'function',
  name: 'getRequiredTools',
  description: functionDescription,
  parameters: {
    type: 'object',
    required: ['agents', 'original_request'],
    properties: {
      agents: {
        type: 'array',
        description: 'The agents name that required to fulfill users request',
        items: {
          type: 'string',
          enum: [
            'token-analyst',
            'goatindex',
            'nft-analyst',
            'lulo-agent',
            'dam',
          ],
        },
      },
      original_request: {
        type: 'string',
        description:
          'The original request that prompted the agent switch as is without any modifications',
      },
    },
  },
};
