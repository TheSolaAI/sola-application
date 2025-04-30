import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { Transaction } from '@solana/web3.js';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:5173');

const Parameters = z.object({
  amount: z.number().describe('Amount of the token to send.'),
  token: z.string().describe('The token that the user wants to send.'),
  tokenTicker: z.string().describe('The token ticker.'),
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

      const transferParams = {
        senderAddress: context.publicKey,
        recipientAddress: address,
        tokenMint: token,
        amount,
      };

      try {
        const prepareResponse = await fetch(
          `${baseUrl}/api/wallet/prepareSplTransfer`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${context.authToken}`,
            },
            body: JSON.stringify(transferParams),
          }
        );

        if (!prepareResponse.ok) {
          return {
            success: false,
            error: `Failed to prepare SPL transfer: ${prepareResponse.status}`,
            data: undefined,
          };
        }

        const responseData = await prepareResponse.json();

        if (!responseData.serializedTransaction) {
          return {
            success: false,
            error:
              'Unable to prepare transfer. Make sure you have enough funds.',
            data: undefined,
          };
        }

        try {
          const transactionBuffer = Buffer.from(
            responseData.serializedTransaction,
            'base64'
          );
          const transaction = Transaction.from(transactionBuffer);

          return {
            success: true,
            data: {
              transaction: responseData.serializedTransaction,
              details: {
                senderAddress: context.publicKey,
                recipientAddress: address,
                tokenMint: token,
                amount,
                transaction,
                params: transferParams,
                tokenTicker: params.tokenTicker,
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
          error: `Unable to prepare transfer transaction: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          data: undefined,
        };
      }
    },
  };

  return transferSplTool;
}
