export const SOLA_TOKEN_ADDRESS =
  'B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump';

export const TIER_THRESHOLDS = [
  [4, 10_000_000],
  [3, 400_000],
  [2, 300_000],
  [1, 100_000],
];

export const SESSIONS_PER_TIER: { [key: number]: number } = {
  0: 0,
  1: 10, // Tier 1
  2: 20, // Tier 2
  3: 30, // Tier 3
  4: 50, // Tier 4
};
