'use client';

import {
  CancelLimitOrderParams,
  CancelLimitOrderResponse,
  LimitOrderParams,
  LimitOrderResponse,
  ShowLimitOrderParams,
  ShowLimitOrderResponse,
} from '@/types/jupiter';
import { apiClient, ApiClient } from '@/lib/ApiClient';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { TransactionChatContent, ChatItem } from '@/types/chatItem';

export async function limitOrderTx(
  params: LimitOrderParams
): Promise<LimitOrderResponse | null> {
  const resp = await apiClient.post<LimitOrderResponse>(
    'api/wallet/jup/limit-order/create',
    params,
    'wallet'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error creating limit order:', resp.errors);
    return null;
  }
  return resp.data;
}

export async function getLimitOrderHandler(
  params: ShowLimitOrderParams
): Promise<ShowLimitOrderResponse | null> {
  const resp = await apiClient.get<ShowLimitOrderResponse>(
    'api/wallet/jup/limit-order/show?address=' + params.public_key,
    undefined,
    'wallet'
  );
  if (ApiClient.isApiError(resp)) {
    console.error('Error cancelling limit order:', resp.errors);
    return null;
  }
  return resp.data;
}

//TODO: Fix cancel limit order
export async function cancelLimitOrderHandler(
  params: CancelLimitOrderParams
): Promise<void | null> {
  // useChatMessageHandler.getState().setCurrentChatItem({
  //   content: {
  //     type: 'loader_message',
  //     text: `Cancelling order ${params.order_id}...`,
  //     response_id: 'temp',
  //     sender: 'system',
  //   },
  //   id: 0,
  //   createdAt: new Date().toISOString(),
  // });
  //
  // if (!rpc) {
  //   return null;
  // }
  // let wallet = params.public_key;
  // if (!wallet) {
  //   return null;
  // }
  //
  // let final_params = {
  //   order_id: params.order_id,
  //   public_key: params.public_key?.address,
  // };
  // console.log(final_params);
  //
  // let resp = await apiClient.post<CancelLimitOrderResponse>(
  //   'api/wallet/jup/limit-order/cancel',
  //   final_params,
  //   'wallet'
  // );
  //
  // if (ApiClient.isApiError(resp)) {
  //   console.error('Error canceling limit order:', resp.errors);
  //   return null;
  // }
  // const connection = new Connection(rpc);
  // let transaction = resp.data.transaction[0];
  // const transactionBuffer = Buffer.from(transaction, 'base64');
  // const final_tx = VersionedTransaction.deserialize(transactionBuffer);
  // const signedTransaction = await wallet.signTransaction(final_tx);
  // const rawTransaction = signedTransaction.serialize();
  // const txid = await connection.sendRawTransaction(rawTransaction);
  //
  // let msg: ChatItem<TransactionChatContent> = {
  //   id: 0,
  //   content: {
  //     response_id: 'temp',
  //     sender: 'system',
  //     type: 'transaction_message',
  //     data: {
  //       title: 'Limit Order Cancelled',
  //       status: 'success',
  //       link: `https://solscan.io/tx/${txid}`,
  //     },
  //   },
  //   createdAt: new Date().toISOString(),
  // };
  //
  // useChatMessageHandler.getState().addMessage(msg);
}
