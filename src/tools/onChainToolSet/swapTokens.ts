import { z } from 'zod';
import { SwapParams, SwapResponse } from '@/types/jupiter';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { API_URLS } from '@/config/api_urls';

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
});

export function createSwapTokensTool(context: ToolContext) {
  const swapTokensTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.swap' as const,
    description:
      'Swaps a specified amount of one token for another token using Jupiter. Use this for all token swap operations except limit orders.',
    parameters: Parameters,
    execute: async (params) => {
      const { inputTokenAddress, outputTokenAddress, amount, swapType } =
        params;

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

      const swapParams: SwapParams = {
        input_mint: inputTokenAddress,
        output_mint: outputTokenAddress,
        amount,
        swap_mode: swapType,
        public_key: context.publicKey,
        priority_fee_needed: false,
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
          const transactionBuffer = Buffer.from(
            response.data.transaction
          ).toString('base64');

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
              },
            },
            error: undefined,
            signAndSend: true,
          };
        } catch (error) {
          return {
            success: false,
            error: 'Error processing transaction data',
            data: undefined,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: 'Unable to prepare swap transaction',
          data: undefined,
        };
      }
    },
  };

  return swapTokensTool;
}
