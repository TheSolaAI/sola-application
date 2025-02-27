import {
  CancelLimitOrderParams,
  CancelLimitOrderResponse,
  LimitOrderParams,
  LimitOrderResponse,
  ShowLimitOrderParams,
  ShowLimitOrderResponse,
} from '../../types/jupiter';
import { apiClient, ApiClient } from '../../api/ApiClient';
import { useChatMessageHandler } from '../../models/ChatMessageHandler';
import { Connection, VersionedTransaction } from '@solana/web3.js';

const rpc = import.meta.env.VITE_SOLANA_RPC;

export async function limitOrderTx(
  params: LimitOrderParams,
): Promise<LimitOrderResponse | null> {
  let resp = await apiClient.post<LimitOrderResponse>(
    'api/wallet/jup/limit-order/create',
    params,
    'wallet'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during getAssetsLulo:', resp.errors);
    return null;
  }
  return resp.data;
}

export async function getLimitOrderHandler(
  params: ShowLimitOrderParams,
): Promise<ShowLimitOrderResponse | null> {
  let resp = await apiClient.get<ShowLimitOrderResponse>(
    'api/wallet/jup/limit-order/show?address=' + params.public_key,
    undefined,
    'wallet'
  )
  if (ApiClient.isApiError(resp)) {
    console.error('Error fetching limit orders:', resp.errors);
    return null;
  }
  return resp.data;
}

export async function cancelLimitOrderHandler(
  params: CancelLimitOrderParams,
): Promise<void|null> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Cancelling order ${params.order_id}...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });
  let currentWallet = params.public_key;
  if (!currentWallet) {
    return null;
  }
  if (!rpc) { 
    return null;
  }
  const connection = new Connection(rpc);
  let final_params = {
    public_key: params.public_key?.address,
    order_id: params.order_id,
  }
  let resp = await apiClient.post<CancelLimitOrderResponse>(
    'api/wallet/jup/limit-order/cancel',
    final_params,
    'wallet'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error during cancelling limit orders:', resp.errors);
    return null;
  }
  console.log(resp.data)
  let transaction = resp.data.transaction[0];
  const transactionBuffer = Buffer.from(transaction, 'base64');
  const final_tx = VersionedTransaction.deserialize(transactionBuffer);
  const signedTransaction = await currentWallet.signTransaction(final_tx);
  const rawTransaction = signedTransaction.serialize();

  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    maxRetries: 10,
  });

  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `(Limit Order Cancelled Successfully)[https://solscan.io/tx/${txid}]`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

}
