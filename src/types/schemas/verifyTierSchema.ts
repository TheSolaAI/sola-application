// src/types/schemas/verifyTierSchema.ts
import { z } from 'zod';
import { SolaWalletBalanceSchema } from './solaBalanceSchema';

// Schema for tier thresholds
export const TierThresholdsSchema = z.object({
  TIER_1: z.number().positive(),
  TIER_2: z.number().positive(),
  TIER_3: z.number().positive(),
  TIER_4: z.number().positive(),
});

// Schema for the tier verification response data
export const TierResponseDataSchema = z.object({
  wallets: z.array(SolaWalletBalanceSchema),
  totalSolaBalance: z.number().nonnegative(),
  tier: z.number().int().min(0, 'Tier must be a non-negative integer'),
  tierThresholds: TierThresholdsSchema,
  previousTier: z.number().int().optional(),
  updated: z.boolean(),
});

// Schema for the tier verification response
export const TierResponseSchema = z.object({
  success: z.boolean(),
  data: TierResponseDataSchema,
  error: z.string().optional(),
});

// Types derived from the schemas
export type TierThresholds = z.infer<typeof TierThresholdsSchema>;
export type TierResponseData = z.infer<typeof TierResponseDataSchema>;
export type TierResponse = z.infer<typeof TierResponseSchema>;

// Utility functions for the API
export function createTierSuccessResponse(
  data: TierResponseData
): TierResponse {
  return {
    success: true,
    data,
  };
}

export function createTierErrorResponse(error: string): {
  success: false;
  error: string;
} {
  return {
    success: false,
    error,
  };
}

// Validation function for tier calculation
export function validateTierCalculation(
  totalBalance: number,
  tier: number,
  thresholds: TierThresholds
): boolean {
  if (totalBalance >= thresholds.TIER_4 && tier !== 4) return false;
  if (
    totalBalance >= thresholds.TIER_3 &&
    totalBalance < thresholds.TIER_4 &&
    tier !== 3
  )
    return false;
  if (
    totalBalance >= thresholds.TIER_2 &&
    totalBalance < thresholds.TIER_3 &&
    tier !== 2
  )
    return false;
  if (
    totalBalance >= thresholds.TIER_1 &&
    totalBalance < thresholds.TIER_2 &&
    tier !== 1
  )
    return false;
  return !(totalBalance < thresholds.TIER_1 && tier !== 0);
}
