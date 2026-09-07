export interface KnownBlinkGame {
  id: string;
  title: string;
  url: string;
  aliases: string[];
}

export const KNOWN_BLINK_GAMES: KnownBlinkGame[] = [
  {
    id: 'coinflip',
    title: 'Coin Flip',
    url: 'https://flip.sendarcade.fun/api/actions/website',
    aliases: ['coinflip', 'coin flip', 'coin-flip', 'flip'],
  },
  {
    id: 'snake',
    title: 'Snakes and Ladders',
    url: 'https://snakes.sendarcade.fun/api/actions/game',
    aliases: [
      'snake',
      'snakes',
      'snake and ladder',
      'snakes and ladders',
      'snakesandladders',
    ],
  },
  {
    id: 'rockpaperscissors',
    title: 'Rock Paper Scissors',
    url: 'https://rps.catoff.xyz/api/actions/create-rock-paper-scissors?clusterurl=mainnet',
    aliases: [
      'rockpaperscissors',
      'rock paper scissors',
      'rock-paper-scissors',
      'rps',
    ],
  },
];

const normalizeAlias = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const GAME_BY_ALIAS = new Map<string, KnownBlinkGame>();

for (const game of KNOWN_BLINK_GAMES) {
  GAME_BY_ALIAS.set(normalizeAlias(game.id), game);
  for (const alias of game.aliases) {
    GAME_BY_ALIAS.set(normalizeAlias(alias), game);
  }
}

export function findKnownBlinkGame(value?: string): KnownBlinkGame | undefined {
  if (!value) return undefined;
  return GAME_BY_ALIAS.get(normalizeAlias(value));
}

export const KNOWN_BLINK_GAME_IDS = KNOWN_BLINK_GAMES.map((game) => game.id);
