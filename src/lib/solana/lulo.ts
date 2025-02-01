
import ApiClient from '../../api/ApiClient';
import {
  DepositParams,
  DepositResponse,
  WithdrawParams,
  WithdrawResponse,
  AssetsParams,
  AssetsResponse,
  WithdrawTransaction,
} from '../../types/lulo';
import { VersionedTransaction } from '@solana/web3.js';

const wallet_service_url = process.env.WALLET_SERVICE_URL;

export async function getAssetsLulo(
  params: AssetsParams,
): Promise<AssetsResponse | null> {
  let resp = await ApiClient.get<AssetsResponse>(
    wallet_service_url + 'api/wallet/lulo/assets?owner='+params.owner,
  );
  return resp;
}

export async function depositLulo(
  params: DepositParams,
): Promise<VersionedTransaction[] | null> {
  
  const response = await ApiClient.post<DepositResponse>(
    wallet_service_url + 'api/wallet/lulo/deposit',
    params,
  );
  if (!response) {
    return null;
  }
  const deposit_transactions = response['transactions'][0];
  try {
    let transactions = [];
    for (let i in deposit_transactions) {
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
export async function withdrawLulo(
  params: WithdrawParams,
): Promise<VersionedTransaction[] | null> {
  
    const response = await ApiClient.post<WithdrawResponse>(
      wallet_service_url + 'api/wallet/lulo/withdraw',
      params,
    );
    if (!response) {
      return null;
    }
    
    const withdraw_transactions: WithdrawTransaction[] | null =
      response.transactions[0];
    if (!withdraw_transactions) {
      return null;
  }
  try {
    let transactions = [];
    for (let i in withdraw_transactions) {
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