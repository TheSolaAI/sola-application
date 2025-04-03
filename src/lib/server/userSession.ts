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

export const extractUserPrivyId = async (accessToken: string) => {
  console.log(accessToken);
  const verifiedClaims = await privy.verifyAuthToken(
    accessToken,
    process.env.PRIVY_VERIFICATION_KEY
  );

  return verifiedClaims.userId;
};

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
      session_created_at: {
        gte: sixHoursAgo,
      },
    },
  });

  return sessionCount < totalAllowedSessions;
};

/**
 * Verify if any of the provided wallets hold SOLA tokens
 * @param wallets Array of wallet addresses to check
 * @returns Object with verification result and balance details
 */
export const verifyHolder = async (wallets: string[]) => {
  if (!wallets || wallets.length === 0) {
    return { isHolder: false, totalBalance: 0, walletBalances: [] };
  }

  try {
    // Use Promise.allSettled instead of Promise.all to handle individual failures
    const walletResults = await Promise.allSettled(
      wallets.map(async (walletAddress) => {
        try {
          const balance = await getSolaBalance(walletAddress);
          return {
            walletAddress,
            solaBalance: balance,
            error: null,
          };
        } catch (err) {
          console.error(`Error processing wallet ${walletAddress}:`, err);
          return {
            walletAddress,
            solaBalance: 0,
            error: err instanceof Error ? err.message : 'Unknown error',
          };
        }
      })
    );

    // Process results, extracting balances from successful requests
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

    return {
      isHolder,
      totalBalance,
      walletBalances,
      hasErrors,
    };
  } catch (error) {
    console.error('Error verifying SOLA holder status:', error);
    return {
      isHolder: false,
      totalBalance: 0,
      walletBalances: [],
      error: true,
    };
  }
};

/**
 * Fetches SOLA token balance for a wallet using RPC API
 */
async function getSolaBalance(walletAddress: string): Promise<number> {
  // Check cache first
  const now = Date.now();
  if (
    balanceCache[walletAddress] &&
    now - balanceCache[walletAddress].timestamp < CACHE_TTL
  ) {
    console.log(`Using cached balance for ${walletAddress}`);
    return balanceCache[walletAddress].balance;
  }

  const SOLANA_RPC_URL =
    process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 6000; // 6 seconds timeout

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // If not first attempt, add a delay using exponential backoff
      if (attempt > 0) {
        const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s, etc.
        console.log(
          `Retry attempt ${attempt}/${MAX_RETRIES} for ${walletAddress}, waiting ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      // Prepare request payload for getTokenAccountsByOwner
      const payload = {
        jsonrpc: '2.0',
        id: 'sola-balance-' + Date.now(),
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          {
            mint: SOLA_TOKEN_ADDRESS, // Filter by SOLA token mint address
          },
          {
            encoding: 'jsonParsed',
          },
        ],
      };

      // Make the request with timeout handling
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      // Clear timeout since fetch completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RPC error: ${response.status}`);
      }

      const data = await response.json();

      // Check for RPC errors in the response
      if (data.error) {
        throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
      }

      // Initialize balance
      let balance = 0;

      // Process all token accounts (there might be multiple with the same mint)
      if (data.result && data.result.value) {
        for (const account of data.result.value) {
          const tokenData = account.account.data.parsed.info;

          // Check if this is the SOLA token
          if (
            tokenData.mint.toLowerCase() === SOLA_TOKEN_ADDRESS.toLowerCase()
          ) {
            const amount = tokenData.tokenAmount.amount;
            const decimals = tokenData.tokenAmount.decimals;

            // Add to total balance, converting from raw units to decimal representation
            balance += Number(amount) / Math.pow(10, decimals);
          }
        }
      }

      // Store in cache
      balanceCache[walletAddress] = {
        balance,
        timestamp: Date.now(),
      };

      return balance;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(
          `Final attempt failed for ${walletAddress}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );

        // Cache a zero balance to prevent repeated failures
        balanceCache[walletAddress] = {
          balance: 0,
          timestamp: Date.now() - CACHE_TTL / 2, // Half TTL for failed requests
        };

        return 0;
      }

      // Log the error but continue to next retry
      console.warn(
        `Attempt ${attempt + 1} failed for ${walletAddress}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return 0; // Default return if all retries fail
}

/**
 * Verify and update a user's tier based on their SOLA token holdings
 * @param privyId User's Privy ID
 * @param accessToken User's access token for wallet verification
 * @returns Object with tier information and update status
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
      console.error('Error fetching wallets:', error);
      return {
        success: false,
        error: 'Failed to fetch user wallets',
      };
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
      console.log(
        `Created new user tier for ${privyId} with tier ${calculatedTier}`
      );
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
      console.log(
        `Updated tier for ${privyId} from ${previousTier} to ${calculatedTier}`
      );
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
    console.error('Error in verifyUserTier:', error);
    return {
      success: false,
      error: 'Failed to verify tier',
      tier: 0,
      totalSolaBalance: 0,
    };
  }
};

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

export const calculateUserTier = async (totalSolaBalance: number) => {
  for (const [tier, threshold] of TIER_THRESHOLDS) {
    if (totalSolaBalance >= threshold) return tier;
  }
  return 0;
};
