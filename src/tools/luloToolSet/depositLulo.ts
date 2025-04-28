import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { VersionedTransaction } from '@solana/web3.js';
import { TOKEN_LIST } from '@/config/tokenMapping';
import { API_URLS } from '@/config/api_urls';
import { DepositParams, DepositResponse } from '@/types/lulo';

const Parameters = z.object({
  amount: z.number(),
  token: z.enum(['USDT', 'USDS', 'USDC']),
});

export function createDepositLuloTool(context: ToolContext) {
  const depositLuloTool: Tool<typeof Parameters, ToolResult> = {
    id: 'lulo.deposit' as const,
    description:
      'Deposits stable coins into Lulo Finance. Only use when the user explicitly requests to deposit stable coins into Lulo.',
    parameters: Parameters,
    execute: async (params) => {
      const { amount, token } = params;

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

      const depositParams: DepositParams = {
        owner: context.publicKey,
        depositAmount: amount,
        mintAddress: TOKEN_LIST[token].MINT,
      };

      try {
        const transactions = await depositLuloTx(
          depositParams,
          context.authToken
        );

        if (!transactions) {
          return {
            success: false,
            error: 'Deposit failed. Unable to create transaction.',
            data: undefined,
          };
        }
        const txResults = [];

        for (const transaction of transactions) {
          const serverApiClient = createServerApiClient(context.authToken);
          const blockhashRes = await serverApiClient.get(
            API_URLS.WALLET.BLOCKHASH
          );

          if (ApiClient.isApiError(blockhashRes)) {
            return {
              success: false,
              error: 'Failed to get recent blockhash',
              data: undefined,
            };
          }

          const { blockhash } = blockhashRes.data;
          transaction.message.recentBlockhash = blockhash;

          // Since we can't directly sign transactions here, we'll return the transaction for signing
          const serializedTx = Buffer.from(transaction.serialize()).toString(
            'base64'
          );

          txResults.push({
            serializedTransaction: serializedTx,
            token,
            amount,
          });
        }

        return {
          success: true,
          data: {
            type: 'lulo_deposit',
            transactions: txResults,
            details: {
              amount,
              token,
              owner: context.publicKey,
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
          error: 'Unable to prepare deposit transaction',
          data: undefined,
        };
      }
    },
  };

  return depositLuloTool;
}

async function depositLuloTx(
  params: DepositParams,
  authToken: string
): Promise<VersionedTransaction[] | null> {
  const serverApiClient = createServerApiClient(authToken);

  const response = await serverApiClient.post<DepositResponse>(
    API_URLS.WALLET.LULO.DEPOSIT,
    params,
    'wallet'
  );

  if (ApiClient.isApiError(response)) {
    console.error('Error during deposit:', response.errors);
    return null;
  }

  const deposit_transactions = response.data.transactions[0];

  try {
    const transactions = [];
    for (const i in deposit_transactions) {
      const transaction = deposit_transactions[i].transaction;
      const transactionBuffer = Buffer.from(transaction, 'base64');
      const final_tx = VersionedTransaction.deserialize(transactionBuffer);
      transactions.push(final_tx);
    }
    return transactions;
  } catch (error) {
    console.error('Error during deposit transaction processing:', error);
    return null;
  }
}
