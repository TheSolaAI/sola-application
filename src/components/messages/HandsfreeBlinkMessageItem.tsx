'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import {
  LuBolt,
  LuCheck,
  LuExternalLink,
  LuLoader,
  LuPlay,
  LuRotateCcw,
  LuWallet,
  LuX,
} from 'react-icons/lu';
import { toast } from 'sonner';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { useWalletHandler } from '@/store/WalletHandler';

export interface BlinkParameter {
  name: string;
  label?: string;
  required?: boolean;
}

export interface BlinkLinkedAction {
  label: string;
  href: string;
  parameters?: BlinkParameter[];
}

export interface BlinkMetadata {
  title: string;
  icon: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions: BlinkLinkedAction[];
  };
}

export interface BlinkActionPayload {
  transaction: string;
  message?: string;
  redirect?: string;
}

export interface BlinkActionPropsData {
  type: string;
  actionUrl: string;
  metadata?: BlinkMetadata;
  transactionPayload?: BlinkActionPayload;
  resolvedHref?: string;
  params?: Record<string, string>;
  account?: string;
  autoExecute?: boolean;
  status?: 'ready' | 'pending' | 'success' | 'error';
}

interface HandsfreeBlinkMessageItemProps {
  props: BlinkActionPropsData;
}

export const HandsfreeBlinkMessageItem: FC<HandsfreeBlinkMessageItemProps> = ({ props }) => {
  const { currentWallet } = useWalletHandler();

  const [metadata, setMetadata] = useState<BlinkMetadata | undefined>(props.metadata);
  const [status, setStatus] = useState<'default' | 'pending' | 'success' | 'error'>(
    props.status === 'success' ? 'success' : props.status === 'error' ? 'error' : 'default'
  );
  const [statusText, setStatusText] = useState<string>(
    props.autoExecute ? 'Handsfree Mode' : 'Ready'
  );
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>(props.params || {});
  const [activeActionIndex, setActiveActionIndex] = useState<number>(0);

  const hasAutoExecutedRef = useRef(false);

  // Available actions list from metadata or default single action
  const actionsList = useMemo<BlinkLinkedAction[]>(() => {
    if (metadata?.links?.actions && metadata.links.actions.length > 0) {
      return metadata.links.actions;
    }
    return [
      {
        label: metadata?.label || 'Execute Blink',
        href: props.actionUrl,
      },
    ];
  }, [metadata, props.actionUrl]);

  const activeAction = actionsList[activeActionIndex] || actionsList[0];

  /**
   * Custom defined function 1: Load Blink metadata if not pre-fetched
   */
  const loadMetadata = useCallback(async () => {
    if (metadata) return;

    try {
      setStatus('pending');
      setStatusText('Fetching metadata...');

      const response = await fetch('/api/blinks/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionUrl: props.actionUrl }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch Blink metadata');
      }

      setMetadata(data.metadata);
      setStatus('default');
      setStatusText(props.autoExecute ? 'Handsfree Ready' : 'Ready');
    } catch (err: any) {
      const msg = err.message || 'Error loading Blink metadata';
      setStatus('error');
      setStatusText('Metadata Error');
      setError(msg);
      toast.error(msg);
    }
  }, [metadata, props.actionUrl, props.autoExecute]);

  /**
   * Custom defined function 2: Initiate the Action for the Blink
   * Requests the serialized transaction payload from the action provider
   */
  const initiateBlinkAction = useCallback(
    async (
      action: BlinkLinkedAction,
      customParams: Record<string, string>
    ): Promise<BlinkActionPayload> => {
      const activeAccount = currentWallet?.address || props.account;
      if (!activeAccount) {
        throw new Error('Please connect your Solana wallet first');
      }

      const response = await fetch('/api/blinks/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionUrl: props.actionUrl,
          actionHref: action.href,
          account: activeAccount,
          params: customParams,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.transactionPayload?.transaction) {
        throw new Error(data.error || 'Failed to initiate Blink action transaction');
      }

      return data.transactionPayload;
    },
    [currentWallet, props.account, props.actionUrl]
  );

  /**
   * Custom defined function 3: Sign with active wallet and send to Solana RPC
   */
  const signAndSendTransaction = useCallback(
    async (base64Tx: string): Promise<string> => {
      if (!currentWallet) {
        throw new Error('No active wallet connected');
      }

      const txBuffer = Buffer.from(base64Tx, 'base64');
      let deserializedTx: Transaction | VersionedTransaction;

      try {
        deserializedTx = VersionedTransaction.deserialize(txBuffer);
      } catch {
        deserializedTx = Transaction.from(txBuffer);
      }

      // Request wallet signature
      if (typeof (currentWallet as any).signTransaction !== 'function') {
        throw new Error('Active wallet does not support programmatic transaction signing');
      }

      const signedTx = await (currentWallet as any).signTransaction(deserializedTx);
      const rawSignedTx =
        signedTx instanceof VersionedTransaction
          ? Buffer.from(signedTx.serialize()).toString('base64')
          : Buffer.from(signedTx.serialize()).toString('base64');

      // Broadcast raw signed transaction via Sola backend RPC proxy
      const sendResponse = await fetch('/api/wallet/sendTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serializedTransaction: rawSignedTx,
          options: { skipPreflight: false, maxRetries: 5 },
        }),
      });

      const sendResult = await sendResponse.json();
      if (!sendResponse.ok || sendResult.status !== 'success' || !sendResult.txid) {
        throw new Error(sendResult.message || 'Transaction submission failed');
      }

      return sendResult.txid;
    },
    [currentWallet]
  );

  /**
   * Custom defined function 4: Complete hands-free / manual action execution flow
   */
  const executeCustomAction = useCallback(
    async (actionToRun?: BlinkLinkedAction) => {
      const targetAction = actionToRun || activeAction;
      setError(null);
      setStatus('pending');
      setStatusText('Initiating Action...');

      try {
        // Step 1: Initiate action & obtain serialized transaction
        let txPayload = props.transactionPayload;
        if (!txPayload?.transaction || actionToRun) {
          txPayload = await initiateBlinkAction(targetAction, inputValues);
        }

        setStatusText('Awaiting Signature...');
        toast.info(txPayload.message || 'Please approve the Blink transaction in your wallet');

        // Step 2: Sign and send
        const txid = await signAndSendTransaction(txPayload.transaction);

        setSignature(txid);
        setStatus('success');
        setStatusText('Success');
        toast.success('Blink action completed successfully!');
      } catch (err: any) {
        const msg = err.message || 'Failed to execute Blink action';
        setStatus('error');
        setStatusText('Execution Failed');
        setError(msg);
        toast.error(msg);
      }
    },
    [activeAction, initiateBlinkAction, inputValues, props.transactionPayload, signAndSendTransaction]
  );

  // Initialize metadata on mount
  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  // Handsfree auto-execution trigger
  useEffect(() => {
    if (
      props.autoExecute &&
      currentWallet &&
      status === 'default' &&
      !hasAutoExecutedRef.current
    ) {
      hasAutoExecutedRef.current = true;
      executeCustomAction();
    }
  }, [props.autoExecute, currentWallet, status, executeCustomAction]);

  const statusIcon =
    status === 'success' ? (
      <LuCheck className="text-green-500" size={20} />
    ) : status === 'error' ? (
      <LuX className="text-red-500" size={20} />
    ) : status === 'pending' ? (
      <LuLoader className="text-primary animate-spin" size={20} />
    ) : (
      <LuBolt className="text-primary" size={20} />
    );

  const footer = (
    <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-secText">
      <span>
        {status === 'success'
          ? 'Transaction confirmed on Solana mainnet'
          : props.autoExecute
            ? 'Handsfree mode enabled via Sola Voice AI'
            : 'Interactive Blink action'}
      </span>
      {signature && (
        <a
          href={`https://solscan.io/tx/${signature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
        >
          View Solscan <LuExternalLink size={12} />
        </a>
      )}
    </div>
  );

  return (
    <BaseStatusMessageItem
      title={metadata?.title || 'Solana Blink Action'}
      status={status}
      statusText={statusText}
      icon={statusIcon}
      footer={footer}
    >
      <div className="space-y-4">
        {/* Banner / Icon & Header Info */}
        <div className="flex items-start gap-3">
          {metadata?.icon && (
            <Image
              src={metadata.icon}
              alt={metadata.title || 'Blink'}
              width={52}
              height={52}
              className="rounded-xl border border-border object-cover flex-shrink-0"
              unoptimized
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-textColor text-sm truncate">
              {metadata?.title || 'Loading Blink...'}
            </h3>
            {metadata?.description && (
              <p className="text-xs text-secText mt-1 line-clamp-2 leading-relaxed">
                {metadata.description}
              </p>
            )}
          </div>
        </div>

        {/* Action URL */}
        <div className="rounded-lg bg-surface/40 p-2 border border-border/50 text-xs">
          <span className="text-secText block mb-0.5 font-medium">Blink Origin:</span>
          <span className="text-textColor break-all font-mono">{props.actionUrl}</span>
        </div>

        {/* Parameter Inputs (if required by active action) */}
        {activeAction?.parameters && activeAction.parameters.length > 0 && (
          <div className="space-y-2 rounded-lg bg-surface/30 p-3 border border-border/60">
            <span className="text-xs font-medium text-secText block">Action Parameters:</span>
            {activeAction.parameters.map((param) => (
              <div key={param.name} className="flex flex-col gap-1">
                <label className="text-xs text-textColor">
                  {param.label || param.name}
                  {param.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  value={inputValues[param.name] || ''}
                  onChange={(e) =>
                    setInputValues((prev) => ({ ...prev, [param.name]: e.target.value }))
                  }
                  placeholder={`Enter ${param.label || param.name}...`}
                  className="rounded-md bg-sec_background border border-border px-3 py-1.5 text-xs text-textColor focus:outline-none focus:border-primary"
                  disabled={status === 'pending'}
                />
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {actionsList.map((action, idx) => (
            <button
              key={`${action.label}-${idx}`}
              onClick={() => {
                setActiveActionIndex(idx);
                executeCustomAction(action);
              }}
              disabled={status === 'pending' || metadata?.disabled}
              className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-black px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {status === 'pending' && idx === activeActionIndex ? (
                <LuLoader className="animate-spin" size={14} />
              ) : (
                <LuPlay size={14} />
              )}
              {action.label}
            </button>
          ))}

          {status === 'error' && (
            <button
              onClick={() => executeCustomAction()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface hover:bg-surface/80 border border-border px-3 py-2 text-xs text-textColor transition-all"
            >
              <LuRotateCcw size={12} /> Retry
            </button>
          )}

          {!currentWallet && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 px-2.5 py-1.5 rounded-lg border border-yellow-500/20">
              <LuWallet size={14} /> Connect wallet to sign handsfree
            </div>
          )}
        </div>
      </div>
    </BaseStatusMessageItem>
  );
};
