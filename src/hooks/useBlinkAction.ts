'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useWalletHandler } from '@/store/WalletHandler';
import {
  applyActionParams,
  canExecuteAction,
  mergeBlinkParams,
} from '@/lib/blinks/params';
import {
  findRequestedAction,
  getLinkedActions,
  sanitizeHttpUrl,
} from '@/lib/blinks/spec';
import {
  bytesToBase64,
  deserializeTransaction,
  encodeBase58,
  getSignMessageBytes,
} from '@/lib/blinks/encoding';
import type {
  BlinkExecutePayload,
  BlinkMetadata,
  BlinkProxyResponse,
  BlinkToolData,
  LinkedActionType,
} from '@/types/blink';

export type BlinkUiStatus =
  | 'loading'
  | 'ready'
  | 'signing'
  | 'success'
  | 'error';

const proxyBlink = async (body: Record<string, unknown>) => {
  const response = await fetch('/api/blinks/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as BlinkProxyResponse;
  if (!response.ok) {
    throw new Error(data.error || 'Blink request failed');
  }
  return data;
};

export function useBlinkAction(props: BlinkToolData) {
  const [metadata, setMetadata] = useState<BlinkMetadata | null>(null);
  const [status, setStatus] = useState<BlinkUiStatus>('loading');
  const [statusText, setStatusText] = useState('Loading Blink');
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [externalLink, setExternalLink] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, string>>(
    props.params ?? {}
  );
  const autoExecuteTriggered = useRef(false);
  const inFlight = useRef(false);
  const currentWallet = useWalletHandler((state) => state.currentWallet);

  const actions = useMemo(
    () => getLinkedActions(metadata, props.actionUrl),
    [metadata, props.actionUrl]
  );

  const selectedAction = useMemo(
    () => findRequestedAction(actions, props.label),
    [actions, props.label]
  );

  const mergedParams = useMemo(
    () => mergeBlinkParams(selectedAction, params),
    [params, selectedAction]
  );

  const readyToExecute = canExecuteAction(selectedAction, mergedParams);

  const setParam = useCallback((name: string, value: string) => {
    setParams((current) => ({ ...current, [name]: value }));
  }, []);

  const loadMetadata = useCallback(async () => {
    autoExecuteTriggered.current = false;
    setStatus('loading');
    setStatusText('Loading Blink');
    setError(null);
    setSignature(null);
    setResultMessage(null);
    setExternalLink(null);

    const data = await proxyBlink({
      intent: 'metadata',
      actionUrl: props.actionUrl,
    });

    if (!data.metadata) {
      throw new Error('Unable to load Blink');
    }

    setMetadata(data.metadata);
    if (data.metadata.error?.message) {
      setError(data.metadata.error.message);
    }

    const nextActions = getLinkedActions(data.metadata, props.actionUrl);
    const nextSelected = findRequestedAction(nextActions, props.label);
    setParams((current) => ({
      ...mergeBlinkParams(nextSelected, current),
    }));

    setStatus('ready');
    setStatusText(data.metadata.disabled ? 'Unavailable' : 'Ready');
  }, [props.actionUrl, props.label]);

  const assertWallet = useCallback(() => {
    if (!currentWallet) {
      throw new Error('Please connect your wallet');
    }
    if (props.account && currentWallet.address !== props.account) {
      throw new Error('Connected wallet does not match the Blink account');
    }
    return currentWallet;
  }, [currentWallet, props.account]);

  const sendTransaction = useCallback(
    async (serializedTransaction: string) => {
      const wallet = assertWallet();
      setStatusText('Waiting for wallet signature');
      const transaction = deserializeTransaction(serializedTransaction);
      const signedTransaction = await wallet.signTransaction(transaction);
      const rawTransaction = signedTransaction.serialize();

      setStatusText('Sending transaction');
      const sendResponse = await fetch('/api/wallet/sendTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serializedTransaction: bytesToBase64(
            rawTransaction instanceof Uint8Array
              ? rawTransaction
              : new Uint8Array(rawTransaction)
          ),
          options: {
            skipPreflight: true,
            maxRetries: 10,
          },
        }),
      });

      const sendData = await sendResponse.json();
      if (!sendResponse.ok || sendData.status !== 'success') {
        throw new Error(sendData.message || 'Unable to send transaction');
      }

      return sendData.txid as string;
    },
    [assertWallet]
  );

  const signMessagePayload = useCallback(
    async (payload: BlinkExecutePayload) => {
      const wallet = assertWallet();
      if (!wallet.signMessage) {
        throw new Error('Connected wallet cannot sign messages');
      }

      setStatusText('Waiting for message signature');
      const encoded = getSignMessageBytes(payload.data);
      const signed = await wallet.signMessage(encoded);
      return encodeBase58(new Uint8Array(signed));
    },
    [assertWallet]
  );

  const handlePayload = useCallback(
    async (payload: BlinkExecutePayload, actionType: LinkedActionType) => {
      switch (actionType) {
        case 'transaction': {
          if (!payload.transaction) {
            throw new Error('Blink did not return a transaction');
          }
          const txid = await sendTransaction(payload.transaction);
          setSignature(txid);
          setResultMessage(payload.message || 'Blink action sent');
          setStatus('success');
          setStatusText('Sent');
          toast.success('Blink action sent');
          return txid;
        }
        case 'message': {
          const signed = await signMessagePayload(payload);
          setSignature(signed);
          setResultMessage(payload.message || 'Message signed');
          setStatus('success');
          setStatusText('Signed');
          toast.success('Blink message signed');
          return signed;
        }
        case 'external-link': {
          const link = sanitizeHttpUrl(payload.externalLink);
          if (!link) {
            throw new Error('Blink returned an unsafe external link');
          }
          setExternalLink(link);
          setResultMessage(
            payload.message || 'Open the linked page to continue'
          );
          setStatus('success');
          setStatusText('Link ready');
          return null;
        }
        case 'post': {
          setResultMessage(payload.message || 'Blink action completed');
          setStatus('success');
          setStatusText('Done');
          toast.success(payload.message || 'Blink action completed');
          return null;
        }
        default: {
          const exhaustive: never = actionType;
          throw new Error(`Unsupported Blink action type: ${exhaustive}`);
        }
      }
    },
    [sendTransaction, signMessagePayload]
  );

  const executeBlinkAction = useCallback(
    async (action = selectedAction) => {
      if (!action || inFlight.current) return;

      const nextParams = mergeBlinkParams(action, params);
      if (metadata?.disabled) {
        setStatus('error');
        setStatusText('Unavailable');
        setError(metadata.error?.message || 'This Blink is disabled');
        return;
      }
      if (!canExecuteAction(action, nextParams)) {
        setStatus('ready');
        setStatusText('Needs input');
        setError('This Blink needs a few details before it can run.');
        return;
      }

      inFlight.current = true;
      setStatus('signing');
      setStatusText('Preparing transaction');
      setError(null);

      try {
        void applyActionParams(props.actionUrl, action.href, nextParams);
        const wallet = assertWallet();
        const data = await proxyBlink({
          intent: 'execute',
          actionUrl: props.actionUrl,
          account: props.account || wallet.address,
          actionHref: action.href,
          params: nextParams,
          actionType: action.type ?? 'transaction',
        });

        if (!data.payload) {
          throw new Error('Blink did not return a payload');
        }

        const actionType = data.payload.type ?? action.type ?? 'transaction';
        const signatureOrNull = await handlePayload(data.payload, actionType);

        const next = data.payload.links?.next;
        if (next?.type === 'inline' && next.action) {
          setMetadata(next.action);
          autoExecuteTriggered.current = true;
          setStatus('ready');
          setStatusText('Next action ready');
        } else if (
          next?.type === 'post' &&
          signatureOrNull &&
          (actionType === 'transaction' || actionType === 'message')
        ) {
          const nextData = await proxyBlink({
            intent: 'next',
            actionUrl: props.actionUrl,
            actionHref: next.href,
            account: props.account || wallet.address,
            signature: signatureOrNull,
            state: data.payload.state,
            signedData: data.payload.data,
          });
          if (nextData.metadata) {
            setMetadata(nextData.metadata);
            autoExecuteTriggered.current = true;
            setStatus('ready');
            setStatusText('Next action ready');
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Blink action failed';
        setStatus('error');
        setStatusText('Failed');
        setError(message);
        toast.error(message);
      } finally {
        inFlight.current = false;
      }
    },
    [
      assertWallet,
      handlePayload,
      metadata?.disabled,
      metadata?.error?.message,
      params,
      props.account,
      props.actionUrl,
      selectedAction,
    ]
  );

  useEffect(() => {
    loadMetadata().catch((err) => {
      const message =
        err instanceof Error ? err.message : 'Unable to load Blink';
      setStatus('error');
      setStatusText('Failed');
      setError(message);
    });
  }, [loadMetadata]);

  useEffect(() => {
    if (
      !props.autoExecute ||
      status !== 'ready' ||
      autoExecuteTriggered.current
    ) {
      return;
    }

    if (!readyToExecute || metadata?.disabled) {
      return;
    }

    autoExecuteTriggered.current = true;
    executeBlinkAction().catch(() => undefined);
  }, [
    executeBlinkAction,
    metadata?.disabled,
    props.autoExecute,
    readyToExecute,
    status,
  ]);

  return {
    metadata,
    status,
    statusText,
    error,
    signature,
    resultMessage,
    externalLink,
    actions,
    selectedAction,
    params: mergedParams,
    readyToExecute,
    setParam,
    executeBlinkAction,
    retry: loadMetadata,
  };
}
