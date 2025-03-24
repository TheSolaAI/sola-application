import { TOOL_NAMES } from '@/lib/constants';

const functionDescription =
  'Get the set of tools required to fulfill users request';

export const getRequiredTools = {
  type: 'function',
  name: 'getRequiredTools',
  description: functionDescription,
  parameters: {
    type: 'object',
    required: ['required_tools', 'original_request'],
    properties: {
      required_tools: {
        type: 'array',
        description: 'The tools that required to fulfill users request',
        items: {
          type: 'string',
          enum: TOOL_NAMES,
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
