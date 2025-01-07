import axios, { AxiosRequestConfig } from 'axios';
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
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
    },
  };

  try {
    const response = await axios.get<any>(
      wallet_service_url + 'api/wallet/lulo/assets',
      config,
    );
    const assets: AssetsResponse = response.data;
    return assets;
  } catch (error) {
    console.error('Error fetching assets:', error);
    return null;
  }
}

export async function depositLulo(
  params: DepositParams,
): Promise<VersionedTransaction[] | null> {
  try {
    const response = await axios.post<any>(
      wallet_service_url + 'api/wallet/lulo/deposit',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const result: DepositResponse = response.data;

    const deposit_transactions = result['transactions'][0];

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
  try {
    const response = await axios.post<any>(
      wallet_service_url + 'api/wallet/lulo/withdraw',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const result: WithdrawResponse = response.data;
    const withdraw_transactions: WithdrawTransaction[] | null =
      result.transactions[0];
    if (!withdraw_transactions) {
      return null;
    }
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
