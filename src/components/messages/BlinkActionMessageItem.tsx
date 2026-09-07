'use client';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import {
  LuBolt,
  LuCheck,
  LuExternalLink,
  LuLoader,
  LuPlay,
  LuX,
} from 'react-icons/lu';
import { toast } from 'sonner';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { useWalletHandler } from '@/store/WalletHandler';

type BlinkParameter = {
  name: string;
  label?: string;
  required?: boolean;
};

type BlinkLinkedAction = {
  label: string;
  href: string;
  parameters?: BlinkParameter[];
};

type BlinkMetadata = {
  title?: string;
  description?: string;
  icon?: string;
  label?: string;
  links?: {
    actions?: BlinkLinkedAction[];
  };
};

type BlinkToolData = {
  actionUrl: string;
  label?: string;
  params?: Record<string, string>;
  account: string;
  autoExecute?: boolean;
};

type BlinkActionMessageItemProps = {
  props: BlinkToolData;
};

type BlinkStatus = 'ready' | 'loading' | 'success' | 'error';

const findRequestedAction = (
  metadata: BlinkMetadata,
  requestedLabel?: string
): BlinkLinkedAction | undefined => {
  const actions = metadata.links?.actions ?? [];

  if (!actions.length) return undefined;
  if (!requestedLabel) return actions[0];

  return (
    actions.find(
      (action) => action.label.toLowerCase() === requestedLabel.toLowerCase()
    ) ??
    actions.find((action) =>
      action.label.toLowerCase().includes(requestedLabel.toLowerCase())
    ) ??
    actions[0]
  );
};

const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

const bytesToBase64 = (value: Uint8Array) => {
  let binary = '';
  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const deserializeTransaction = (transaction: string) => {
  const buffer = base64ToBytes(transaction);

  try {
    return VersionedTransaction.deserialize(buffer);
  } catch {
    return Transaction.from(buffer);
  }
};

export const BlinkActionMessageItem: FC<BlinkActionMessageItemProps> = ({
  props,
}) => {
  const [metadata, setMetadata] = useState<BlinkMetadata | null>(null);
  const [status, setStatus] = useState<BlinkStatus>('loading');
  const [statusText, setStatusText] = useState('Loading Blink');
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [autoExecuteTriggered, setAutoExecuteTriggered] = useState(false);
  const currentWallet = useWalletHandler((state) => state.currentWallet);

  const selectedAction = useMemo(
    () => (metadata ? findRequestedAction(metadata, props.label) : undefined),
    [metadata, props.label]
  );

  const loadMetadata = useCallback(async () => {
    setStatus('loading');
    setStatusText('Loading Blink');
    setError(null);

    const response = await fetch('/api/blinks/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionUrl: props.actionUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load Blink');
    }

    setMetadata(data.metadata);
    setStatus('ready');
    setStatusText('Ready');
  }, [props.actionUrl]);

  const executeBlinkAction = useCallback(
    async (action = selectedAction) => {
      if (!currentWallet) {
        toast.error('Please connect your wallet');
        return;
      }

      if (
        props.account &&
        currentWallet.address.toLowerCase() !== props.account.toLowerCase()
      ) {
        toast.error('Connected wallet does not match the Blink account');
        return;
      }

      setStatus('loading');
      setStatusText('Preparing transaction');
      setError(null);

      try {
        const response = await fetch('/api/blinks/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionUrl: props.actionUrl,
            account: props.account || currentWallet.address,
            actionHref: action?.href,
            params: props.params,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to create Blink transaction');
        }

        if (data.metadata) {
          setMetadata(data.metadata);
        }

        const serializedTransaction = data.transactionPayload?.transaction;
        if (!serializedTransaction) {
          throw new Error('Blink did not return a transaction');
        }

        setStatusText('Waiting for wallet signature');
        const transaction = deserializeTransaction(serializedTransaction);
        const signedTransaction =
          await currentWallet.signTransaction(transaction);
        const rawTransaction = signedTransaction.serialize();

        setStatusText('Sending transaction');
        const sendResponse = await fetch('/api/wallet/sendTransaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serializedTransaction: bytesToBase64(rawTransaction),
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

        setSignature(sendData.txid);
        setStatus('success');
        setStatusText('Sent');
        toast.success('Blink action sent');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Blink action failed';
        setStatus('error');
        setStatusText('Failed');
        setError(message);
        toast.error(message);
      }
    },
    [
      currentWallet,
      props.account,
      props.actionUrl,
      props.params,
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
    if (props.autoExecute && status === 'ready' && !autoExecuteTriggered) {
      setAutoExecuteTriggered(true);
      executeBlinkAction();
    }
  }, [autoExecuteTriggered, executeBlinkAction, props.autoExecute, status]);

  const statusIcon =
    status === 'success' ? (
      <LuCheck className="text-green-500" size={22} />
    ) : status === 'error' ? (
      <LuX className="text-red-500" size={22} />
    ) : status === 'loading' ? (
      <LuLoader className="text-primary animate-spin" size={22} />
    ) : (
      <LuBolt className="text-primary" size={22} />
    );

  const footer = (
    <div className="flex justify-between items-center gap-3 text-xs text-secText">
      <span>
        {status === 'success'
          ? 'Blink action transaction has been sent.'
          : 'Handsfree Blink execution uses Sola custom action handlers.'}
      </span>
      {signature && (
        <a
          href={`https://solscan.io/tx/${signature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition flex items-center gap-1"
        >
          Explorer <LuExternalLink size={12} />
        </a>
      )}
    </div>
  );

  return (
    <BaseStatusMessageItem
      title={metadata?.title || 'Blink Action'}
      status={
        status === 'ready'
          ? 'default'
          : status === 'loading'
            ? 'pending'
            : status
      }
      statusText={statusText}
      icon={statusIcon}
      footer={footer}
    >
      <div className="space-y-4">
        {metadata?.icon && (
          // Plain <img> for arbitrary Blink hosts (avoid next/image remote-host constraints)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={metadata.icon}
            alt={metadata.title || 'Blink icon'}
            width={56}
            height={56}
            className="w-14 h-14 rounded-xl object-cover border border-border"
          />
        )}

        {metadata?.description && (
          <p className="text-sm text-secText leading-relaxed">
            {metadata.description}
          </p>
        )}

        <div className="rounded-lg bg-background p-3 space-y-2">
          <p className="text-xs text-secText">Action URL</p>
          <p className="text-xs text-textColor break-all">{props.actionUrl}</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-wrap gap-2">
          {(metadata?.links?.actions?.length
            ? metadata.links.actions
            : [{ label: metadata?.label || 'Run Blink', href: props.actionUrl }]
          ).map((action) => (
            <button
              key={`${action.label}-${action.href}`}
              onClick={() => executeBlinkAction(action)}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'loading' ? (
                <LuLoader className="animate-spin" size={16} />
              ) : (
                <LuPlay size={16} />
              )}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </BaseStatusMessageItem>
  );
};
