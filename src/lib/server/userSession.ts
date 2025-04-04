'use server';

import { SESSIONS_PER_TIER, TIER_THRESHOLDS } from '@/config/constants';
import { SOLA_TOKEN_ADDRESS } from '@/config/constants';
import { prisma } from '@/lib/prisma';
import { PrivyClient } from '@privy-io/server-auth';
import axios from 'axios';

const balanceCache: Record<string, { balance: number; timestamp: number }> = {};
const CACHE_TTL = 60 * 1000;

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);

/**
 * Extracts the Privy user ID from the provided access token.
 * @param accessToken The user's access token.
 * @returns The user's Privy ID.
 */
export const extractUserPrivyId = async (accessToken: string) => {
  const verifiedClaims = await privy.verifyAuthToken(
    accessToken,
    process.env.PRIVY_VERIFICATION_KEY
  );
  return verifiedClaims.userId;
};

/**
 * Checks if a user can create a new session based on their tier.
 * @param privyId The user's Privy ID.
 * @param tierId The user's tier.
 * @returns True if the user has available sessions; otherwise, false.
 */
export const verifySession = async (
  privyId: string,
  tierId: number
): Promise<boolean> => {
  const totalAllowedSessions = SESSIONS_PER_TIER[tierId];
  const sixHoursAgo = new Date();
  sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

  const sessionCount = await prisma.userSessions.count({
    where: {
      privy_id: privyId,
      session_created_at: { gte: sixHoursAgo },
    },
  });

  return sessionCount < totalAllowedSessions;
};

/**
 * Verifies whether any of the provided wallets hold SOLA tokens.
 * @param wallets Array of wallet addresses.
 * @returns Object with verification result and balance details.
 */
export const verifyHolder = async (wallets: string[]) => {
  if (!wallets || wallets.length === 0) {
    return { isHolder: false, totalBalance: 0, walletBalances: [] };
  }

  try {
    const walletResults = await Promise.allSettled(
      wallets.map(async (walletAddress) => {
        try {
          const balance = await getSolaBalance(walletAddress);
          return { walletAddress, solaBalance: balance, error: null };
        } catch (err) {
          return {
            walletAddress,
            solaBalance: 0,
            error: err instanceof Error ? err.message : 'Unknown error',
          };
        }
      })
    );

    const walletBalances = walletResults
      .map((result) => {
        if (result.status === 'fulfilled') {
          return {
            walletAddress: result.value.walletAddress,
            solaBalance: result.value.solaBalance,
            error: result.value.error,
          };
        } else {
          return {
            walletAddress: 'unknown',
            solaBalance: 0,
            error: result.reason || 'Failed to process wallet',
          };
        }
      })
      .filter((wallet) => wallet.walletAddress !== 'unknown');

    const totalBalance = walletBalances.reduce(
      (total, wallet) => total + (wallet.solaBalance || 0),
      0
    );

    const isHolder = totalBalance > 0;
    const hasErrors = walletBalances.some((wallet) => wallet.error !== null);

    return { isHolder, totalBalance, walletBalances, hasErrors };
  } catch (error) {
    console.log(error);
    return {
      isHolder: false,
      totalBalance: 0,
      walletBalances: [],
      error: true,
    };
  }
};

/**
 * Fetches the SOLA token balance for a wallet using an RPC API, with caching.
 * @param walletAddress The wallet address.
 * @returns The SOLA token balance.
 */
async function getSolaBalance(walletAddress: string): Promise<number> {
  const now = Date.now();
  if (
    balanceCache[walletAddress] &&
    now - balanceCache[walletAddress].timestamp < CACHE_TTL
  ) {
    return balanceCache[walletAddress].balance;
  }

  const SOLANA_RPC_URL =
    process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 6000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const payload = {
        jsonrpc: '2.0',
        id: 'sola-balance-' + Date.now(),
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          { mint: SOLA_TOKEN_ADDRESS },
          { encoding: 'jsonParsed' },
        ],
      };

      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RPC error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
      }

      let balance = 0;
      if (data.result && data.result.value) {
        for (const account of data.result.value) {
          const tokenData = account.account.data.parsed.info;
          if (
            tokenData.mint.toLowerCase() === SOLA_TOKEN_ADDRESS.toLowerCase()
          ) {
            const amount = tokenData.tokenAmount.amount;
            const decimals = tokenData.tokenAmount.decimals;
            balance += Number(amount) / Math.pow(10, decimals);
          }
        }
      }

      balanceCache[walletAddress] = { balance, timestamp: Date.now() };
      return balance;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        balanceCache[walletAddress] = {
          balance: 0,
          timestamp: Date.now() - CACHE_TTL / 2,
        };
        return 0;
      }
    }
  }

  return 0;
}

/**
 * Verifies and updates a user's tier based on their SOLA token holdings.
 * @param privyId The user's Privy ID.
 * @param accessToken The access token for wallet verification.
 * @returns Object with tier information and update status.
 */
export const verifyUserTier = async (privyId: string, accessToken: string) => {
  try {
    let wallets;
    try {
      const walletResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}auth/wallet/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      wallets = walletResponse.data;
      if (!wallets || !Array.isArray(wallets)) {
        throw new Error(
          'Invalid wallet data format received from auth service'
        );
      }
    } catch (error) {
      console.log(error);
      return { success: false, error: 'Failed to fetch user wallets' };
    }

    if (wallets.length === 0) {
      return {
        success: false,
        error: 'No wallets found for user',
        tier: 0,
        totalSolaBalance: 0,
      };
    }

    const walletAddresses = [
      ...new Set(wallets.map((wallet) => wallet.wallet_address)),
    ];
    const { totalBalance, walletBalances } =
      await verifyHolder(walletAddresses);
    const calculatedTier = await calculateUserTier(totalBalance);

    let userTier;
    let updated = false;
    let previousTier;

    userTier = await prisma.userTier.findUnique({
      where: { privy_id: privyId },
    });

    if (!userTier) {
      userTier = await prisma.userTier.create({
        data: {
          privy_id: privyId,
          tier: calculatedTier,
          total_sola_balance: totalBalance,
          last_updated: new Date(),
        },
      });
      updated = true;
    } else if (
      userTier.tier !== calculatedTier ||
      Math.abs(userTier.total_sola_balance - totalBalance) > 0.001
    ) {
      previousTier = userTier.tier;
      userTier = await prisma.userTier.update({
        where: { privy_id: privyId },
        data: {
          tier: calculatedTier,
          total_sola_balance: totalBalance,
          last_updated: new Date(),
          updated_count: { increment: 1 },
        },
      });
      updated = true;
    }

    return {
      success: true,
      tier: calculatedTier,
      totalSolaBalance: totalBalance,
      walletBalances,
      tierThresholds: TIER_THRESHOLDS,
      previousTier: updated ? previousTier : undefined,
      updated,
      sessionsAllowed: SESSIONS_PER_TIER[calculatedTier] || 0,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: 'Failed to verify tier',
      tier: 0,
      totalSolaBalance: 0,
    };
  }
};

/**
 * Records a user's session usage.
 * @param privyId The user's Privy ID.
 * @param sessionId The session identifier.
 * @returns The created session record.
 */
export const recordSessionUsage = async (
  privyId: string,
  sessionId: string
) => {
  return prisma.userSessions.create({
    data: {
      privy_id: privyId,
      session_id: sessionId,
      session_created_at: new Date(),
    },
  });
};

/**
 * Calculates the user's tier based on their total SOLA balance.
 * @param totalSolaBalance The total SOLA token balance.
 * @returns The calculated tier.
 */
export const calculateUserTier = async (totalSolaBalance: number) => {
  for (const [tier, threshold] of TIER_THRESHOLDS) {
    if (totalSolaBalance >= threshold) return tier;
  }
  return 0;
};
