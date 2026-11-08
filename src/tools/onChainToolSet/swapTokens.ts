import { z } from 'zod';
import { SwapParams, SwapResponse } from '@/types/jupiter';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { API_URLS } from '@/config/api_urls';
import {
  addPriorityFeeToSerializedTransaction,
  PriorityFeeLevel,
} from '@/utils/priorityFee';

const Parameters = z.object({
  inputTokenAddress: z.string().describe('Token Address to swap from'),
  outputTokenAddress: z.string().describe('Token Address to swap to'),
  inputTokenTicker: z.string().describe('Token Ticker to swap from'),
  outputTokenTicker: z.string().describe('Token Ticker to swap to'),
  amount: z
    .number()
    .describe(
      'The amount for the swap. If swapType is EXACT_IN, this is the amount of tokenA. If swapType is EXACT_OUT, this is the amount of tokenB. If swapType is EXACT_DOLLAR, this is the dollar amount to swap. Must be greater than 0.'
    ),
  swapType: z
    .enum(['EXACT_IN', 'EXACT_OUT', 'EXACT_DOLLAR'])
    .describe(
      'The type of swap: EXACT_IN specifies the amount of tokenA being swapped, EXACT_OUT specifies the amount of tokenB to receive, and EXACT_DOLLAR specifies the dollar amount to be swapped'
    ),
  assetType: z
    .enum(['TOKEN', 'XSTOCKS'])
    .describe(
      'The type of asset swapped. TOKEN specifies crypto tokens and XSTOCKS specifies xstock tokens'
    ),
  priorityFeeLevel: z
    .enum(['none', 'low', 'medium', 'high', 'veryHigh', 'custom'])
    .optional()
    .describe('Optional priority fee preset level for the transaction'),
  customPriorityFee: z
    .number()
    .optional()
    .describe('Optional custom priority fee in microLamports'),
});

export function createSwapTokensTool(context: ToolContext) {
  const swapTokensTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.swap' as const,
    description:
      'Swaps a specified amount of one token or xstocks for another token or xstocks using Jupiter. Use this for all token swap operations except limit orders.',
    parameters: Parameters,
    execute: async (params) => {
      const {
        inputTokenAddress,
        outputTokenAddress,
        amount,
        swapType,
        assetType,
        priorityFeeLevel,
        customPriorityFee,
      } = params;

      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      if (!context.publicKey) {
        return {
          success: false,
          error: 'No public key provided',
          data: undefined,
        };
      }

      const serverApiClient = createServerApiClient(context.authToken);
      const priorityFeeRequested =
        (priorityFeeLevel !== undefined && priorityFeeLevel !== 'none') ||
        customPriorityFee !== undefined;

      const swapParams: SwapParams = {
        input_mint: inputTokenAddress,
        output_mint: outputTokenAddress,
        amount,
        swap_mode: swapType,
        public_key: context.publicKey,
        priority_fee_needed: priorityFeeRequested,
      };

      try {
        const response = await serverApiClient.post<SwapResponse>(
          API_URLS.WALLET.JUPITER.SWAP,
          swapParams,
          'wallet'
        );

        if (ApiClient.isApiError(response)) {
          return {
            success: false,
            error: 'Failed to create swap transaction',
            data: undefined,
          };
        }

        if (!response.data.transaction) {
          return {
            success: false,
            error: 'Unable to prepare swap. Make sure you have enough funds.',
            data: undefined,
          };
        }

        try {
          let transactionBuffer = Buffer.from(
            response.data.transaction
          ).toString('base64');

          if (priorityFeeRequested) {
            const prioritized = addPriorityFeeToSerializedTransaction(
              transactionBuffer,
              context.publicKey,
              {
                level: (priorityFeeLevel as PriorityFeeLevel) ?? 'medium',
                customFee: customPriorityFee,
              }
            );
            transactionBuffer = prioritized.serializedTransaction;
          }

          return {
            success: true,
            data: {
              transactionHash: transactionBuffer,
              details: {
                input_mint: inputTokenAddress,
                output_mint: outputTokenAddress,
                amount,
                outAmount: response.data.outAmount,
                priorityFee: response.data.priorityFee,
                versionedTransaction: transactionBuffer,
                inputParams: swapParams,
                tickers: {
                  inputTokenTicker: params.inputTokenTicker,
                  outputTokenTicker: params.outputTokenTicker,
                },
                assetType: assetType,
              },
            },
            error: undefined,
            signAndSend: true,
          };
        } catch (error) {
          return {
            success: false,
            error: `Transaction error: ${error}`,
            data: undefined,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: `Swap error: ${error}`,
          data: undefined,
        };
      }
    },
  };

  return swapTokensTool;
}
