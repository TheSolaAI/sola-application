import { z } from 'zod';
import { Tool } from 'ai';
import { ToolContext, ToolResult } from '@/types/tool';
import { ApiClient, createServerApiClient } from '@/lib/ApiClient';
import { VersionedTransaction } from '@solana/web3.js';
import { TOKEN_LIST } from '@/config/tokenMapping';
import { API_URLS } from '@/config/api_urls';
import {
  WithdrawParams,
  WithdrawResponse,
  WithdrawTransaction,
} from '@/types/lulo';

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:5173');

const Parameters = z.object({
  amount: z.number(),
  token: z.enum(['USDT', 'USDS', 'USDC']),
});

export function createWithdrawLuloTool(context: ToolContext) {
  const withdrawLuloTool: Tool<typeof Parameters, ToolResult> = {
    id: 'lulo.withdraw' as const,
    description:
      'Withdraws stable coins from Lulo Finance. Only use when the user explicitly requests to withdraw stable coins from Lulo. Ensure the user specifies the correct stable coin (USDS or USDC) and an amount.',
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

      const withdrawParams: WithdrawParams = {
        owner: context.publicKey,
        withdrawAmount: amount,
        mintAddress: TOKEN_LIST[token].MINT,
        withdrawAll: false,
      };

      try {
        const transactions = await withdrawLuloTx(
          withdrawParams,
          context.authToken
        );

        if (!transactions) {
          return {
            success: false,
            error: 'Withdrawal failed. Unable to create transaction.',
            data: undefined,
          };
        }

        const txResults = [];

        for (const transaction of transactions) {
          // Get recent blockhash using fetch
          const blockhashRes = await fetch(`${baseUrl}/api/wallet/blockhash`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${context.authToken}`,
            },
          });

          if (!blockhashRes.ok) {
            return {
              success: false,
              error: `Failed to get recent blockhash: ${blockhashRes.status}`,
              data: undefined,
            };
          }

          const blockhashData = await blockhashRes.json();
          transaction.message.recentBlockhash = blockhashData.blockhash;

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
          transaction: txResults,
          data: {
            type: 'lulo_withdraw',
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
          signAndSend: true,
        };
      } catch (error) {
        return {
          success: false,
          error: `Unable to prepare withdrawal transaction: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          data: undefined,
        };
      }
    },
  };

  return withdrawLuloTool;
}

// Integrated withdrawLuloTx function - keeping this unchanged as requested
async function withdrawLuloTx(
  params: WithdrawParams,
  authToken: string
): Promise<VersionedTransaction[] | null> {
  const serverApiClient = createServerApiClient(authToken);

  const response = await serverApiClient.post<WithdrawResponse>(
    API_URLS.WALLET.LULO.WITHDRAW,
    params,
    'wallet'
  );

  if (ApiClient.isApiError(response)) {
    console.error('Error during withdrawal:', response.errors);
    return null;
  }

  const withdraw_transactions: WithdrawTransaction[] | null =
    response.data.transactions[0];

  if (!withdraw_transactions) {
    return null;
  }

  try {
    const transactions = [];
    for (const i in withdraw_transactions) {
      const transaction = withdraw_transactions[i].transaction;
      const transactionBuffer = Buffer.from(transaction, 'base64');
      const final_tx = VersionedTransaction.deserialize(transactionBuffer);
      transactions.push(final_tx);
    }
    return transactions;
  } catch (error) {
    console.error('Error during withdrawal transaction processing:', error);
    return null;
  }
}
