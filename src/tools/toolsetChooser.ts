import { TOOLSET_SLUGS } from '@/config/ai';

const functionDescription =
  'Based on the user request return the required toolset to fulfill the request';

export const getRequiredToolset = {
  type: 'function',
  name: 'getRequiredToolset',
  description: functionDescription,
  parameters: {
    type: 'object',
    required: ['toolset', 'original_request'],
    properties: {
      toolset: {
        type: 'string',
        description: 'The toolset required to fulfill the user request',
        enum: TOOLSET_SLUGS,
      },
      original_request: {
        type: 'string',
        description:
          'The original request from the user without any modifications',
      },
    },
  },
};
