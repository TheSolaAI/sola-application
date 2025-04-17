import { z } from 'zod';

// Schema for a single wallet balance
export const SolaWalletBalanceSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  walletProvider: z.string().min(1, 'Wallet provider is required'),
  solaBalance: z.number().nonnegative('Balance must be a non-negative number'),
});

// Schema for the response data
export const SolaBalanceDataSchema = z.object({
  wallets: z.array(SolaWalletBalanceSchema),
  totalSolaBalance: z
    .number()
    .nonnegative('Total balance must be a non-negative number'),
});

// Schema for the response object
export const SolaBalanceResponseSchema = z.object({
  success: z.boolean(),
  data: SolaBalanceDataSchema,
  error: z.string().optional(),
});

// Schema for error response
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

// Types derived from the schemas
export type SolaWalletBalance = z.infer<typeof SolaWalletBalanceSchema>;
export type SolaBalanceData = z.infer<typeof SolaBalanceDataSchema>;
export type SolaBalanceResponse = z.infer<typeof SolaBalanceResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Utility functions for the API
export function createSuccessResponse(
  data: SolaBalanceData
): SolaBalanceResponse {
  return {
    success: true,
    data,
  };
}

export function createErrorResponse(error: string): ErrorResponse {
  return {
    success: false,
    error,
  };
}
