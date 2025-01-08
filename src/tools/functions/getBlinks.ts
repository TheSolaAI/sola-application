const functionDescription =
  'Call this function whenuser wants to play coinflip game in blinks or try blinks'

export const getBlinks = {
  type: 'function',
  name: 'getBlinks',
  description: functionDescription,
  parameters: {
    type: 'object',
    strict: true,
    properties: {
        blinks: {
            type: 'string',
            description: 'name of the blink or game the user wants to play',
            enum: ['coinflip', 'snake', 'rockPaperScissor'],
        },
        required: ['blinks'],
    },
  },
};

//TODO: Shift the trigger logic here from conversation.tsx
export function getBlinksFunction() {
  
}
