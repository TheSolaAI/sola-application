'use client';

import { useCallback, useState } from 'react';
import {
  BlinkActionLink,
  BlinkActionMetadata,
  pickDefaultAction,
} from '@/lib/blinks/urlSafety';
import { useWalletHandler } from '@/store/WalletHandler';
import { VersionedTransaction } from '@solana/web3.js';

export type BlinkActionState =
  | 'idle'
  | 'loading_metadata'
  | 'ready'
  | 'executing'
  | 'success'
  | 'error';

export type BlinkExecutionResult = {
  signature?: string;
  message?: string;
  transactionBase64?: string;
};

export function useBlinkAction() {
  const [state, setState] = useState<BlinkActionState>('idle');
  const [metadata, setMetadata] = useState<BlinkActionMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BlinkExecutionResult | null>(null);
  const [selectedAction, setSelectedAction] = useState<BlinkActionLink | null>(null);

  const loadMetadata = useCallback(async (blinkUrl: string) => {
    setState('loading_metadata');
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/blinks/action?url=${encodeURIComponent(blinkUrl)}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load blink metadata');
      const meta = json.data as BlinkActionMetadata;
      setMetadata(meta);
      const def = pickDefaultAction(meta);
      setSelectedAction(def);
      setState('ready');
      return meta;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Metadata load failed';
      setError(message);
      setState('error');
      throw err;
    }
  }, []);

  const executeAction = useCallback(
    async (blinkUrl: string, action?: BlinkActionLink | null) => {
      setState('executing');
      setError(null);
      try {
        const currentWallet = useWalletHandler.getState().currentWallet;
        if (!currentWallet) throw new Error('No wallet connected');
        const account = currentWallet.address;
        if (!account) throw new Error('Unable to resolve wallet account address');
        const actionToUse = action ?? selectedAction;
        const res = await fetch('/api/blinks/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: blinkUrl, account, actionHref: actionToUse?.href || '' }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to build blink transaction');
        const payload = json.data as { transaction?: string; message?: string };
        if (!payload.transaction) {
          const message = payload.message || 'Blink completed without a transaction';
          setResult({ message });
          setState('success');
          return { message };
        }
        const transactionBuffer = Buffer.from(payload.transaction, 'base64');
        const transaction = VersionedTransaction.deserialize(transactionBuffer);
        const signed = await currentWallet.signTransaction(transaction);
        const raw = signed.serialize();
        const sendRes = await fetch('/api/wallet/sendTransaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serializedTransaction: Buffer.from(raw).toString('base64'),
            options: { skipPreflight: true, maxRetries: 10 },
          }),
        });
        const sendJson = await sendRes.json();
        if (!sendRes.ok) throw new Error(sendJson.message || 'Failed to send blink transaction');
        const signature = sendJson.txid || sendJson.signature;
        setResult({ signature, transactionBase64: payload.transaction, message: 'Blink action signed and sent' });
        setState('success');
        return { signature };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Blink execution failed';
        setError(message);
        setState('error');
        throw err;
      }
    },
    [selectedAction]
  );

  const autoExecute = useCallback(
    async (blinkUrl: string) => {
      const meta = await loadMetadata(blinkUrl);
      const action = pickDefaultAction(meta);
      setSelectedAction(action);
      return executeAction(blinkUrl, action);
    },
    [loadMetadata, executeAction]
  );

  return { state, metadata, error, result, selectedAction, setSelectedAction, loadMetadata, executeAction, autoExecute };
}
