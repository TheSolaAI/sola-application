// src/app/api/user/verify-tier/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrivyClient } from '@privy-io/server-auth';
import { z } from 'zod';
import {
  TierResponseDataSchema,
  createTierSuccessResponse,
  createTierErrorResponse,
  validateTierCalculation,
} from '@/types/schemas/verifyTierSchema';
import { SolaBalanceResponse } from '@/types/schemas/solaBalanceSchema';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Privy client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);
const PRIVY_VERIFICATION_KEY = process.env.PRIVY_VERIFICATION_KEY || '';

// Constants for tier thresholds in SOLA tokens
const TIER_THRESHOLDS = {
  TIER_1: 500_000, // 500K SOLA
  TIER_2: 1_000_000, // 1M SOLA
  TIER_3: 5_000_000, // 5M SOLA
  TIER_4: 10_000_000, // 10M SOLA
};

/**
 * Endpoint to verify and update a user's tier based on their SOLA token holdings
 */
export async function GET(req: NextRequest) {
  try {
    // Get authorization token
    const authToken = req.headers.get('Authorization')?.split(' ')[1];
    if (!authToken) {
      return NextResponse.json(createTierErrorResponse('Unauthorized'), {
        status: 401,
      });
    }

    // Step 1: Verify auth token using Privy SDK and get user ID
    let privyUserId: string;
    try {
      // Verify token using Privy SDK
      const verifiedClaims = await privy.verifyAuthToken(
        authToken,
        PRIVY_VERIFICATION_KEY
      );

      privyUserId = verifiedClaims.userId;

      if (!privyUserId) {
        throw new Error('User ID not found in verified claims');
      }

      console.log(`Authenticated user with Privy ID: ${privyUserId}`);
    } catch (error) {
      console.error('Error verifying Privy auth token:', error);
      return NextResponse.json(
        createTierErrorResponse('Invalid or expired authentication token'),
        { status: 401 }
      );
    }

    // Step 2: Get user's database ID from Privy ID
    let userId: number;
    try {
      const userRecord = await prisma.authw_user.findFirst({
        where: {
          // Assuming username is used to store Privy ID
          username: privyUserId,
        },
      });

      if (!userRecord) {
        throw new Error(`No user found with Privy ID: ${privyUserId}`);
      }

      userId = userRecord.id;
    } catch (error) {
      console.error('Error finding user in database:', error);
      return NextResponse.json(
        createTierErrorResponse('User not found in database'),
        { status: 404 }
      );
    }

    // Step 3: Fetch SOLA balance data from sola-balance endpoint
    let balanceData: { wallets: any[]; totalSolaBalance: number };
    try {
      // Make server-side request to our own sola-balance API
      const solaBalanceResponse = await fetch(
        new URL('/api/user/sola-balance', req.url).toString(),
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!solaBalanceResponse.ok) {
        const errorData = await solaBalanceResponse.json();
        throw new Error(
          errorData.error ||
            `Failed to fetch SOLA balances: ${solaBalanceResponse.status}`
        );
      }

      const solaBalanceData: SolaBalanceResponse =
        await solaBalanceResponse.json();

      if (!solaBalanceData.success || !solaBalanceData.data) {
        throw new Error('Invalid response from SOLA balance endpoint');
      }

      balanceData = solaBalanceData.data;
    } catch (error) {
      console.error('Error fetching SOLA balances:', error);
      return NextResponse.json(
        createTierErrorResponse('Failed to fetch SOLA balances'),
        { status: 500 }
      );
    }

    // Extract wallet information and total balance
    const { wallets: solaBalances, totalSolaBalance } = balanceData;

    // Step 4: Determine user tier based on total SOLA balance
    const calculatedTier = determineTier(totalSolaBalance);

    // Validate tier calculation
    if (
      !validateTierCalculation(
        totalSolaBalance,
        calculatedTier,
        TIER_THRESHOLDS
      )
    ) {
      console.error(
        `Tier calculation validation failed: balance=${totalSolaBalance}, tier=${calculatedTier}`
      );
      return NextResponse.json(
        createTierErrorResponse('Internal error: Tier calculation error'),
        { status: 500 }
      );
    }

    // Step 5: Check if user exists in analytics table and get current tier
    let userMetrics;
    let updated = false;
    let previousTier;

    try {
      // Try to find existing user metrics
      userMetrics = await prisma.user_analytics_session_metrics.findUnique({
        where: { user_id: userId },
      });

      // User metrics don't exist, create a new record
      if (!userMetrics) {
        userMetrics = await prisma.user_analytics_session_metrics.create({
          data: {
            user_id: userId,
            user_tier: calculatedTier,
            sessions_created: 0,
            sessions_left: 0,
          },
        });
        console.log(
          `Created new user metrics for user ${userId} with tier ${calculatedTier}`
        );
        updated = true;
      }
      // User metrics exist but tier needs updating
      else if (userMetrics.user_tier !== calculatedTier) {
        previousTier = userMetrics.user_tier;
        userMetrics = await prisma.user_analytics_session_metrics.update({
          where: { user_id: userId },
          data: { user_tier: calculatedTier },
        });
        console.log(
          `Updated tier for user ${userId} from ${previousTier} to ${calculatedTier}`
        );
        updated = true;
      }
    } catch (error) {
      console.error('Error updating user tier in DB:', error);
      // Continue execution to at least return the tier info, even if DB update failed
    }

    // Step 6: Prepare response data
    const responseData = {
      wallets: solaBalances,
      totalSolaBalance,
      tier: calculatedTier,
      tierThresholds: TIER_THRESHOLDS,
      previousTier: updated ? previousTier : undefined,
      updated,
    };

    // Validate response data against schema
    try {
      TierResponseDataSchema.parse(responseData);
      return NextResponse.json(createTierSuccessResponse(responseData));
    } catch (validationError) {
      console.error('Validation error in tier response:', validationError);

      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          createTierErrorResponse(
            `Data validation error: ${validationError.errors.map((e) => e.message).join(', ')}`
          ),
          { status: 500 }
        );
      }

      throw validationError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error in verify-tier endpoint:', error);
    return NextResponse.json(createTierErrorResponse('Failed to verify tier'), {
      status: 500,
    });
  } finally {
    // Always disconnect from Prisma when done
    await prisma.$disconnect();
  }
}

/**
 * Determine user tier based on total SOLA balance
 */
function determineTier(totalSolaBalance: number): number {
  if (totalSolaBalance >= TIER_THRESHOLDS.TIER_4) return 4;
  if (totalSolaBalance >= TIER_THRESHOLDS.TIER_3) return 3;
  if (totalSolaBalance >= TIER_THRESHOLDS.TIER_2) return 2;
  if (totalSolaBalance >= TIER_THRESHOLDS.TIER_1) return 1;
  return 0; // Default tier
}
