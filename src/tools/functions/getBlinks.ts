const functionDescription = `This function is called when the user wants to play a game or perform a blink action. 
  The user can choose from available options, such as coin flip, snake and ladder, or rock-paper-scissors.`;

export const getBlinks = {
  type: 'function',
  name: 'getBlinks',
  description: functionDescription,
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      actionName: {
        type: 'string',
        enum: ['coinflip', 'snake', 'rockpaperscissors'],
        description:
          'Specifies the game or blink action the user wants to perform.',
      },
    },
    required: ['actionName'],
  },
};
