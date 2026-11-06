'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import {
  LuCheck,
  LuExternalLink,
  LuLoader,
  LuPlay,
  LuRefreshCw,
  LuZap,
} from 'react-icons/lu';
import { toast } from 'sonner';
import { useWalletHandler } from '@/store/WalletHandler';
import {
  BlinkActionLink,
  BlinkActionMessageData,
  BlinkActionMetadata,
  getExecutableBlinkActions,
  hasAllRequiredBlinkParameters,
  selectBlinkAction,
} from '@/lib/blinks/actionExecutor';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';

interface BlinkActionMessageItemProps {
  props: BlinkActionMessageData;
}

export const BlinkActionMessageItem: FC<BlinkActionMessageItemProps> = ({
  props,
}) => {
  const currentWallet = useWalletHandler((state) => state.currentWallet);
  const [metadata, setMetadata] = useState<BlinkActionMetadata | null>(
    props.metadata ?? null
  );
  const [selectedAction, setSelectedAction] = useState<BlinkActionLink | null>(
    props.metadata
      ? selectBlinkAction(props.metadata, props.actionUrl, props.actionLabel)
      : null
  );
  const [parameters, setParameters] = useState<Record<string, string>>(
    props.parameters ?? {}
  );
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(
    !props.metadata
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasAutoExecutedRef = useRef<boolean>(false);

  const actions = useMemo(
    () =>
      metadata ? getExecutableBlinkActions(metadata, props.actionUrl) : [],
    [metadata, props.actionUrl]
  );

  const loadBlinkMetadata = useCallback(async () => {
    setIsLoadingMetadata(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/blinks/action?url=${encodeURIComponent(props.actionUrl)}`
      );
      const payload = await response.json();

      if (!response.ok || !payload.success || !payload.metadata) {
        throw new Error(payload.error || 'Failed to load Blink metadata.');
      }

      const loadedMetadata = payload.metadata as BlinkActionMetadata;
      setMetadata(loadedMetadata);
      setSelectedAction(
        selectBlinkAction(loadedMetadata, props.actionUrl, props.actionLabel)
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to fetch Blink metadata.'
      );
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [props.actionLabel, props.actionUrl]);

  const selectAction = useCallback((action: BlinkActionLink) => {
    setSelectedAction(action);
    setErrorMessage(null);
    setStatusMessage(null);
  }, []);

  const updateActionParameter = useCallback((name: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const signAndBroadcastTransaction = useCallback(
    async (base64Transaction: string): Promise<string> => {
      if (!currentWallet) {
        throw new Error('Please connect your Solana wallet first.');
      }

      const txBuffer = Buffer.from(base64Transaction, 'base64');
      let serializedSigned: Uint8Array;

      try {
        const versionedTx = VersionedTransaction.deserialize(txBuffer);
        const signedTx = await currentWallet.signTransaction(versionedTx);
        serializedSigned = signedTx.serialize();
      } catch {
        const legacyTx = Transaction.from(txBuffer);
        const signedLegacy = await currentWallet.signTransaction(legacyTx);
        serializedSigned = signedLegacy.serialize();
      }

      const sendResponse = await fetch('/api/wallet/sendTransaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serializedTransaction:
            Buffer.from(serializedSigned).toString('base64'),
          options: {
            skipPreflight: true,
            maxRetries: 10,
          },
        }),
      });

      const sendPayload = await sendResponse.json();
      if (!sendResponse.ok || !sendPayload.signature) {
        throw new Error(
          sendPayload.error ||
            sendPayload.details ||
            'Failed to broadcast Blink transaction.'
        );
      }

      return sendPayload.signature as string;
    },
    [currentWallet]
  );

  const initiateBlinkAction = useCallback(
    async (
      actionOverride?: BlinkActionLink,
      parametersOverride?: Record<string, string>
    ) => {
      const targetAction = actionOverride ?? selectedAction;
      const activeParams = parametersOverride ?? parameters;

      if (!targetAction || isExecuting) {
        return;
      }

      const walletAddress = currentWallet?.address || props.walletAddress;
      if (!walletAddress) {
        const msg = 'Connect a Solana wallet to execute this Blink action.';
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      if (!hasAllRequiredBlinkParameters(targetAction, activeParams)) {
        const msg =
          'Please fill in all required Blink parameters before executing.';
        setErrorMessage(msg);
        return;
      }

      setIsExecuting(true);
      setErrorMessage(null);
      setStatusMessage(`Initiating "${targetAction.label}"...`);

      try {
        const response = await fetch('/api/blinks/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            actionUrl: props.actionUrl,
            href: targetAction.href,
            account: walletAddress,
            parameters: activeParams,
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload.success || !payload.transaction) {
          throw new Error(payload.error || 'Blink action failed.');
        }

        setStatusMessage('Signing and sending transaction...');
        const signature = await signAndBroadcastTransaction(
          payload.transaction
        );
        setTxSignature(signature);
        setStatusMessage(
          payload.message || 'Blink action executed successfully.'
        );
        toast.success('Blink action completed');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Blink action execution failed.';
        setErrorMessage(message);
        setStatusMessage(null);
        toast.error(message);
      } finally {
        setIsExecuting(false);
      }
    },
    [
      currentWallet?.address,
      isExecuting,
      parameters,
      props.actionUrl,
      props.walletAddress,
      selectedAction,
      signAndBroadcastTransaction,
    ]
  );

  useEffect(() => {
    if (!props.metadata) {
      void loadBlinkMetadata();
    }
  }, [loadBlinkMetadata, props.metadata]);

  useEffect(() => {
    if (
      !props.autoExecute ||
      hasAutoExecutedRef.current ||
      isLoadingMetadata ||
      !metadata ||
      metadata.disabled ||
      !selectedAction ||
      !currentWallet?.address
    ) {
      return;
    }

    if (hasAllRequiredBlinkParameters(selectedAction, parameters)) {
      hasAutoExecutedRef.current = true;
      void initiateBlinkAction(selectedAction, parameters);
    }
  }, [
    currentWallet?.address,
    initiateBlinkAction,
    isLoadingMetadata,
    metadata,
    parameters,
    props.autoExecute,
    selectedAction,
  ]);

  const compactContent = (
    <div className="flex items-center gap-2">
      <span className="text-textColor text-sm font-medium truncate">
        {metadata?.title || 'Solana Blink'}
      </span>
      {selectedAction && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
          {selectedAction.label}
        </span>
      )}
    </div>
  );

  const compactFooter = (
    <div className="flex items-center justify-between w-full text-xs text-secText">
      <span>
        {txSignature
          ? 'Completed'
          : isExecuting
            ? 'Executing handsfree...'
            : props.autoExecute
              ? 'Handsfree Ready'
              : 'Interactive Blink'}
      </span>
      <a
        href={props.actionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 rounded-full hover:bg-surface/50 transition-colors"
        title="Open Action Endpoint"
        onClick={(e) => e.stopPropagation()}
      >
        <LuExternalLink className="text-secText" size={12} />
      </a>
    </div>
  );

  const expandedContent = (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {metadata?.icon ? (
            <img
              src={metadata.icon}
              alt={metadata.title}
              className="w-12 h-12 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <LuZap className="text-primary" size={22} />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-textColor">
              {metadata?.title || 'Solana Blink Action'}
            </h3>
            {metadata?.description && (
              <p className="text-xs text-secText mt-1">
                {metadata.description}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadBlinkMetadata()}
          disabled={isLoadingMetadata || isExecuting}
          className="p-1.5 rounded-lg border border-border hover:bg-surface/50 text-secText disabled:opacity-50"
          title="Reload Blink metadata"
        >
          <LuRefreshCw
            size={14}
            className={isLoadingMetadata ? 'animate-spin' : ''}
          />
        </button>
      </div>

      {isLoadingMetadata && (
        <div className="flex items-center gap-2 text-xs text-secText py-2">
          <LuLoader className="animate-spin text-primary" size={14} />
          <span>Loading Blink actions...</span>
        </div>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const isSelected = selectedAction?.href === action.href;
            return (
              <button
                key={`${action.label}-${action.href}`}
                type="button"
                onClick={() => selectAction(action)}
                disabled={isExecuting}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background text-textColor border-border hover:bg-surface/40'
                }`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {selectedAction?.parameters && selectedAction.parameters.length > 0 && (
        <div className="flex flex-col gap-2">
          {selectedAction.parameters.map((parameter) => (
            <label key={parameter.name} className="flex flex-col gap-1">
              <span className="text-xs text-secText">
                {parameter.label || parameter.name}
                {parameter.required ? ' *' : ''}
              </span>
              <input
                type="text"
                value={parameters[parameter.name] ?? ''}
                placeholder={parameter.patternDescription || parameter.label}
                onChange={(event) =>
                  updateActionParameter(parameter.name, event.target.value)
                }
                className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-textColor"
              />
            </label>
          ))}
        </div>
      )}

      {selectedAction && (
        <button
          type="button"
          disabled={isExecuting || Boolean(metadata?.disabled)}
          onClick={() => void initiateBlinkAction()}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {isExecuting ? (
            <>
              <LuLoader className="animate-spin" size={14} />
              <span>Executing {selectedAction.label}...</span>
            </>
          ) : (
            <>
              <LuPlay size={14} />
              <span>{selectedAction.label}</span>
            </>
          )}
        </button>
      )}

      {statusMessage && (
        <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-3 py-2 rounded-lg">
          <LuCheck size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {txSignature && (
        <a
          href={`https://solscan.io/tx/${txSignature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <span>View Transaction ({txSignature.slice(0, 8)}...)</span>
          <LuExternalLink size={12} />
        </a>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );

  return (
    <BaseExpandableMessageItem
      title={metadata?.title || 'Solana Blink'}
      icon={<LuZap className="text-primary" size={16} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
      maxWidth="max-w-lg"
    />
  );
};
