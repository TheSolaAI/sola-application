export const SOLA_TOKEN_ADDRESS =
  'B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump';

export const TIER_THRESHOLDS = {
  TIER_1: 500_000, // 500K SOLA
  TIER_2: 1_000_000, // 1M SOLA
  TIER_3: 5_000_000, // 5M SOLA
  TIER_4: 10_000_000, // 10M SOLA
};

export const SESSIONS_PER_TIER: { [key: number]: number } = {
  0: 5, // Basic tier
  1: 10, // Tier 1
  2: 20, // Tier 2
  3: 30, // Tier 3
  4: 50, // Tier 4
};
