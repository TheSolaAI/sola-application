const functionDescription =
  'Call this function when the user wants to know about the upcoming nft launches.';

export const getNFTLaunchpad = {
  type: 'function',
  name: 'getNFTLaunchpad',
  description: functionDescription,
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getNFTLaunchpadFunction() {}
