import { useState, useCallback } from 'react';
import { VersionedTransaction } from '@solana/web3.js';
import { useWalletHandler } from '@/store/WalletHandler';
import { BlinkActionMetadata, BlinkActionResponse } from '@/types/blinks';
import { toast } from 'sonner';

export type BlinkStatus =
  | 'idle'
  | 'fetching_metadata'
  | 'ready'
  | 'initiating_action'
  | 'signing_wallet'
  | 'sending_transaction'
  | 'confirming_transaction'
  | 'confirmed'
  | 'error';

export interface UseBlinkActionReturn {
  status: BlinkStatus;
  metadata: BlinkActionMetadata | null;
  txHash: string | null;
  errorMessage: string | null;
  fetchMetadata: (actionUrl: string) => Promise<BlinkActionMetadata | null>;
  initiateAction: (
    actionUrl: string,
    targetHref?: string,
    params?: Record<string, any>
  ) => Promise<string | null>;
  reset: () => void;
}

export async function waitForTransactionConfirmation(
  signature: string,
  maxAttempts = 15,
  intervalMs = 2000
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let onChainError: Error | null = null;
    try {
      const response = await fetch('/api/wallet/getTransaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
          options: {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.transaction) {
          if (data.error || data.transaction.meta?.err) {
            const errDetail = data.transaction.meta?.err;
            onChainError = new Error(
              `Transaction failed on-chain: ${
                typeof errDetail === 'object'
                  ? JSON.stringify(errDetail)
                  : String(errDetail || 'Transaction execution failed')
              }`
            );
          } else {
            return true;
          }
        }
      }
    } catch (err: any) {
      // Network fetch error during polling, allow retry
    }

    if (onChainError) {
      throw onChainError;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    'Transaction confirmation timed out. It may still be processed by Solana validators.'
  );
}

export function useBlinkAction(): UseBlinkActionReturn {
  const [status, setStatus] = useState<BlinkStatus>('idle');
  const [metadata, setMetadata] = useState<BlinkActionMetadata | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMetadata = useCallback(
    async (actionUrl: string): Promise<BlinkActionMetadata | null> => {
      setStatus('fetching_metadata');
      setErrorMessage(null);
      try {
        const res = await fetch(actionUrl, {
          headers: {
            Accept: 'application/json',
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch blink metadata: HTTP ${res.status}`);
        }
        const data: BlinkActionMetadata = await res.json();
        setMetadata(data);
        setStatus('ready');
        return data;
      } catch (err: any) {
        const msg = err?.message || 'Error fetching blink metadata';
        setErrorMessage(msg);
        setStatus('error');
        return null;
      }
    },
    []
  );

  const initiateAction = useCallback(
    async (
      actionUrl: string,
      targetHref?: string,
      params?: Record<string, any>
    ): Promise<string | null> => {
      const currentWallet = useWalletHandler.getState().currentWallet;
      if (!currentWallet || !currentWallet.address) {
        const msg =
          'No wallet connected. Please connect a Solana wallet first.';
        setErrorMessage(msg);
        setStatus('error');
        toast.error(msg);
        return null;
      }

      try {
        setStatus('initiating_action');
        setErrorMessage(null);

        // Resolve endpoint URL
        let postUrl = targetHref || actionUrl;
        if (
          targetHref &&
          !targetHref.startsWith('http://') &&
          !targetHref.startsWith('https://')
        ) {
          const base = new URL(actionUrl);
          postUrl = new URL(targetHref, base.origin).toString();
        }

        // 1. Post account to the Blink action endpoint
        const postBody = {
          account: currentWallet.address,
          ...(params || {}),
        };

        const res = await fetch(postUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(postBody),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(
            errJson?.message ||
              `Action request failed with status ${res.status}`
          );
        }

        const actionData: BlinkActionResponse = await res.json();
        if (!actionData.transaction) {
          throw new Error('Action response missing serialized transaction.');
        }

        // 2. Sign transaction via connected wallet
        setStatus('signing_wallet');
        const transactionBuffer = Buffer.from(actionData.transaction, 'base64');
        const transaction = VersionedTransaction.deserialize(transactionBuffer);
        const signedTransaction =
          await currentWallet.signTransaction(transaction);

        // 3. Broadcast transaction via Sola wallet relay
        setStatus('sending_transaction');
        const rawSerialized = signedTransaction.serialize();
        const sendRes = await fetch('/api/wallet/sendTransaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serializedTransaction:
              Buffer.from(rawSerialized).toString('base64'),
            options: {
              skipPreflight: true,
              maxRetries: 10,
            },
          }),
        });

        const sendData = await sendRes.json();
        if (!sendRes.ok || sendData.status === 'error') {
          throw new Error(
            sendData?.message || 'Failed to broadcast transaction'
          );
        }

        const finalTxid = sendData.txid || sendData.signature;
        setTxHash(finalTxid);

        // 4. Wait for on-chain confirmation before reporting confirmed
        setStatus('confirming_transaction');
        await waitForTransactionConfirmation(finalTxid);

        setStatus('confirmed');
        toast.success('Blink action executed and confirmed on Solana!');
        return finalTxid;
      } catch (err: any) {
        const msg = err?.message || 'Failed to initiate blink action';
        setErrorMessage(msg);
        setStatus('error');
        toast.error(msg);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setMetadata(null);
    setTxHash(null);
    setErrorMessage(null);
  }, []);

  return {
    status,
    metadata,
    txHash,
    errorMessage,
    fetchMetadata,
    initiateAction,
    reset,
  };
}
