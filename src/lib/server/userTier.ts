import { prisma } from '@/lib/prisma';
import { getUserTier, TIME_WINDOW_HOURS } from '@/config/tierMapping'; // Adjust the path if necessary
import { UserTierStatus } from '@/types/tier';

export async function hasExceededUsageLimit(
  privyId: string
): Promise<UserTierStatus> {
  const now = new Date();

  const cutoffTime = new Date(
    now.getTime() - TIME_WINDOW_HOURS * 60 * 60 * 1000
  );

  const user = await prisma.userTier.findUnique({
    where: { privy_id: privyId },
  });

  if (!user) {
    throw new Error(`User with privyId ${privyId} not found.`);
  }

  const totalSolaBalance = user.total_sola_balance;

  const userTier = getUserTier(totalSolaBalance);

  const recentUsage = await prisma.usageRecord.aggregate({
    _sum: {
      usdConsumed: true,
      tokensUsed: true,
    },
    where: {
      privy_id: privyId,
      usedAt: {
        gte: cutoffTime,
      },
    },
  });

  const totalUsdUsed = recentUsage._sum.usdConsumed ?? 0;

  if (totalUsdUsed > userTier.usageLimitUSD) {
    return {
      active: false,
      tier: userTier.id,
      usageLimitUSD: userTier.usageLimitUSD,
      percentageUsed: 100,
    };
  }
  return {
    active: true,
    tier: userTier.id,
    usageLimitUSD: userTier.usageLimitUSD,
    percentageUsed: (totalUsdUsed / userTier.usageLimitUSD) * 100,
  };
}
