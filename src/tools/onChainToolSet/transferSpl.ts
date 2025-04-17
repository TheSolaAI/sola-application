import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { Transaction } from '@solana/web3.js';

const Parameters = z.object({
  amount: z.number().describe('Amount of the token to send.'),
  token: z.string().describe('The token that the user wants to send.'),
  address: z.string().describe('Recipient wallet address or .sol domain.'),
});

export function createTransferSplTool(context: ToolContext) {
  const transferSplTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.transfer' as const,
    description:
      'Transfers SPL tokens (non-SOL) to an address or a .sol domain. Do not autocorrect or modify .sol domains, as they are arbitrary and may not have meaningful words.',
    parameters: Parameters,
    execute: async (params) => {
      const { amount, token, address } = params;

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

      const transferParams = {
        senderAddress: context.publicKey,
        recipientAddress: address,
        tokenMint: token,
        amount,
      };

      try {
        const prepareResponse = await serverApiClient.post(
          '/api/wallet/prepareSplTransfer',
          transferParams,
          'wallet'
        );

        if (ApiClient.isApiError(prepareResponse)) {
          return {
            success: false,
            error: 'Failed to prepare SPL transfer',
            data: undefined,
          };
        }

        if (!prepareResponse.data.serializedTransaction) {
          return {
            success: false,
            error:
              'Unable to prepare transfer. Make sure you have enough funds.',
            data: undefined,
          };
        }

        try {
          const transactionBuffer = Buffer.from(
            prepareResponse.data.serializedTransaction,
            'base64'
          );
          const transaction = Transaction.from(transactionBuffer);

          return {
            success: true,
            data: {
              type: 'transfer_spl',
              transaction: prepareResponse.data.serializedTransaction,
              details: {
                senderAddress: context.publicKey,
                recipientAddress: address,
                tokenMint: token,
                amount,
                transaction: transaction,
                params: transferParams,
              },
              response_id: 'temp',
              sender: 'system',
              timestamp: new Date().toISOString(),
            },
            error: undefined,
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
          error: 'Unable to prepare transfer transaction',
          data: undefined,
        };
      }
    },
  };

  return transferSplTool;
}
