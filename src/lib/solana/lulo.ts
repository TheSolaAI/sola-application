import { apiClient, ApiClient } from '@/lib/ApiClient';
import {
  DepositParams,
  DepositResponse,
  WithdrawParams,
  WithdrawResponse,
  AssetsParams,
  AssetsResponse,
  WithdrawTransaction,
} from '@/types/lulo';
import { VersionedTransaction } from '@solana/web3.js';

const wallet_service_url = process.env.NEXT_PUBLIC_WALLET_SERVICE_URL;

export async function getAssetsLulo(
  params: AssetsParams
): Promise<AssetsResponse | null> {
  const resp = await apiClient.get<AssetsResponse>(
    wallet_service_url + 'api/wallet/lulo/assets?owner=' + params.owner
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getAssetsLulo:', resp.errors);
    return null;
  }
  return resp.data;
}

export async function depositLuloTx(
  params: DepositParams
): Promise<VersionedTransaction[] | null> {
  const response = await apiClient.post<DepositResponse>(
    wallet_service_url + 'api/wallet/lulo/deposit',
    params
  );
  if (ApiClient.isApiError(response)) {
    console.error('Error during deposit:', response.errors);
    return null;
  }
  const deposit_transactions = response.data['transactions'][0];
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
    console.error('Error during deposit:', error);
    return null;
  }
}
export async function withdrawLuloTx(
  params: WithdrawParams
): Promise<VersionedTransaction[] | null> {
  const response = await apiClient.post<WithdrawResponse>(
    wallet_service_url + 'api/wallet/lulo/withdraw',
    params
  );

  if (ApiClient.isApiError(response)) {
    console.error('Error during withdraw:', response.errors);
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
    console.error('Error during withdraw:', error);
    return null;
  }
}
