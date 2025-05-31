import { z } from 'zod';

const TierSchema = z.object({
  id: z.number(),
  minTokens: z.number().nonnegative(),
  usageLimitUSD: z.number().nonnegative(),
});

export type Tier = z.infer<typeof TierSchema>;

const TierConfigSchema = z.array(TierSchema);

export const UserTiers: Tier[] = TierConfigSchema.parse([
  { id: 0, minTokens: 0, usageLimitUSD: 0.5 },
  { id: 1, minTokens: 50_000, usageLimitUSD: 1 },
  { id: 2, minTokens: 100_000, usageLimitUSD: 2 },
  { id: 3, minTokens: 500_000, usageLimitUSD: 5 },
  { id: 4, minTokens: 1_000_000, usageLimitUSD: 10 },
  { id: 5, minTokens: 5_000_000, usageLimitUSD: 20 },
]);

export function getUserTier(balance: number): Tier {
  return (
    [...UserTiers].reverse().find((tier) => balance >= tier.minTokens) ??
    UserTiers[0]
  );
}

export const TIME_WINDOW_HOURS = 6;
