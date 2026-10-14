import { getBlinksParameters, executeBlinkParameters } from './actions';

export const getBlinksToolSet = () => ({
  slug: 'blinks',
  name: 'Blink games',
  description:
    'Play Solana Blink games: coin flip, snakes and ladders, and rock-paper-scissors. Load available actions, then initiate the user-selected action handsfree.',
  tools: {
    getBlinks: {
      description:
        'Load a Blink game and its available actions and parameters. Call this before executeBlink. Ask the user for any missing choices or amounts; never invent them.',
      parameters: getBlinksParameters,
    },
    executeBlink: {
      description:
        'Initiate the action the user requested using an action index and parameters returned by getBlinks. Requires wallet approval. Only call when the user has specified the action and all required parameter values. Report the returned success or error; never retry a transaction automatically.',
      parameters: executeBlinkParameters,
    },
  },
});
