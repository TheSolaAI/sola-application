import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { API_URLS } from '@/config/api_urls';

const Parameters = z.object({
  quantity: z
    .number()
    .describe(
      'Amount of SOL (Solana) to transfer. This value should be in SOL, not lamports.'
    ),
  address: z.string().describe('Recipient wallet address or a .sol domain.'),
});

export function createTransferSolTool(context: ToolContext) {
  const transferSolTool: Tool<typeof Parameters, ToolResult> = {
    id: 'token.transferSol' as const,
    description:
      'Transfers SOL (Solana) to a recipient using either a wallet address or a .sol domain. Do not modify or autocorrect .sol domains, as they are arbitrary and may not have meaningful words.',
    parameters: Parameters,
    execute: async (params) => {
      const { quantity, address } = params;

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

      try {
        // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
        const lamports = quantity * 1_000_000_000;

        // Create transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(context.publicKey),
            toPubkey: new PublicKey(address),
            lamports: lamports,
          })
        );

        // Get recent blockhash
        const blockhashResponse = await serverApiClient.get(
          API_URLS.WALLET.BLOCKHASH,
          undefined,
          'wallet'
        );

        if (ApiClient.isApiError(blockhashResponse)) {
          return {
            success: false,
            error: 'Failed to get recent blockhash',
            data: undefined,
          };
        }

        transaction.recentBlockhash = blockhashResponse.data.blockhash;
        transaction.feePayer = new PublicKey(context.publicKey);

        // Serialize the transaction
        const serializedTransaction = Buffer.from(
          transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          })
        ).toString('base64');

        return {
          success: true,
          data: {
            type: 'transfer_sol',
            transaction: serializedTransaction,
            details: {
              senderAddress: context.publicKey,
              recipientAddress: address,
              amount: quantity,
              lamports: lamports,
              transactionObject: transaction,
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
          error: `Unable to prepare SOL transfer: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: undefined,
        };
      }
    },
  };

  return transferSolTool;
}
