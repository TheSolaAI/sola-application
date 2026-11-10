'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { LuExternalLink, LuPlay, LuRefreshCw, LuZap } from 'react-icons/lu';
import { toast } from 'sonner';
import { VersionedTransaction } from '@solana/web3.js';
import { useWalletHandler } from '@/store/WalletHandler';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import {
  BlinkActionGetResponse,
  BlinkLinkedAction,
  fetchBlinkMetadata,
  initiateBlinkAction,
  normalizeBlinkActions,
} from '@/tools/blinksToolSet/actions';

export interface BlinkMessageData {
  mode?: 'inspect' | 'execute';
  actionUrl: string;
  metadata?: BlinkActionGetResponse;
  actions?: BlinkLinkedAction[];
  actionLabel?: string;
  targetHref?: string;
  transaction?: string;
  message?: string;
  parameters?: Record<string, string | number>;
  autoExecuteAction?: string;
}

export interface BlinkMessageItemProps {
  props: BlinkMessageData;
  onActionInitiated?: (result: {
    actionLabel: string;
    transaction: string;
    signature?: string;
  }) => void;
}

export const BlinkMessageItem: FC<BlinkMessageItemProps> = ({
  props,
  onActionInitiated,
}) => {
  const [metadata, setMetadata] = useState<BlinkActionGetResponse | undefined>(
    props.metadata
  );
  const [actions, setActions] = useState<BlinkLinkedAction[]>(
    props.actions ||
      (props.metadata
        ? normalizeBlinkActions(props.actionUrl, props.metadata)
        : [])
  );
  const [paramState, setParamState] = useState<
    Record<string, Record<string, string>>
  >(() => {
    if (!props.parameters) return {};
    const initial: Record<string, string> = {};
    for (const [k, v] of Object.entries(props.parameters)) {
      initial[k] = String(v);
    }
    return { default: initial };
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeActionLabel, setActiveActionLabel] = useState<string | null>(
    props.actionLabel || null
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(
    props.message || null
  );
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // Custom function to refresh Blink metadata from the action endpoint
  const refreshBlinkMetadata = useCallback(async () => {
    try {
      const refreshed = await fetchBlinkMetadata(props.actionUrl);
      setMetadata(refreshed.metadata);
      setActions(refreshed.actions);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to refresh Blink metadata'
      );
    }
  }, [props.actionUrl]);

  // Custom function to update parameter values for a specific Blink action
  const handleParameterChange = useCallback(
    (actionHref: string, paramName: string, value: string) => {
      setParamState((prev) => ({
        ...prev,
        [actionHref]: {
          ...(prev[actionHref] || {}),
          [paramName]: value,
        },
      }));
    },
    []
  );

  // Custom function to initiate a Blink action, sign the returned transaction, and broadcast it
  const initiateAction = useCallback(
    async (
      actionSelector: string | number,
      overrideParams?: Record<string, string | number>
    ) => {
      const currentWallet = useWalletHandler.getState().currentWallet;
      if (!currentWallet?.address) {
        toast.error('Please connect your wallet to execute this Blink action');
        return;
      }

      setIsExecuting(true);
      try {
        const selectorKey = String(actionSelector);
        const mergedParams: Record<string, string | number> = {
          ...(paramState.default || {}),
          ...(paramState[selectorKey] || {}),
          ...(overrideParams || {}),
        };

        const execution = await initiateBlinkAction({
          actionUrl: props.actionUrl,
          account: currentWallet.address,
          actionSelector,
          parameters: mergedParams,
          metadata,
        });

        setActiveActionLabel(execution.actionLabel);
        if (execution.message) {
          setStatusMessage(execution.message);
        }

        const txBuffer = Buffer.from(execution.transaction, 'base64');
        const versionedTx = VersionedTransaction.deserialize(txBuffer);
        const signedTx = await currentWallet.signTransaction(versionedTx);
        const rawTx = signedTx.serialize();

        const sendResponse = await fetch('/api/wallet/sendTransaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serializedTransaction: Buffer.from(rawTx).toString('base64'),
            options: { skipPreflight: true, maxRetries: 10 },
          }),
        });

        let signature: string | undefined;
        if (sendResponse.ok) {
          const responseData = await sendResponse.json();
          signature = responseData?.signature || responseData?.txid;
          if (signature) {
            setTxSignature(signature);
          }
          toast.success(`Executed Blink action: ${execution.actionLabel}`);
        } else {
          toast.error('Failed to broadcast signed Blink transaction');
        }

        onActionInitiated?.({
          actionLabel: execution.actionLabel,
          transaction: execution.transaction,
          signature,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to execute Blink action'
        );
      } finally {
        setIsExecuting(false);
      }
    },
    [metadata, onActionInitiated, paramState, props.actionUrl]
  );

  // Hands-free auto-trigger when an explicit autoExecuteAction selector is provided
  useEffect(() => {
    if (props.autoExecuteAction && !props.transaction) {
      initiateAction(props.autoExecuteAction, props.parameters);
    }
  }, [
    initiateAction,
    props.autoExecuteAction,
    props.parameters,
    props.transaction,
  ]);

  const title = metadata?.title || props.actionLabel || 'Solana Blink';
  const description =
    metadata?.description ||
    props.message ||
    'Hands-free Solana Blockchain Action';

  const compactContent = (
    <div className="flex items-center gap-2">
      <span className="text-textColor text-sm font-medium truncate">
        {title}
        {activeActionLabel ? ` • ${activeActionLabel}` : ''}
      </span>
    </div>
  );

  const compactFooter = (
    <>
      <div className="flex items-center gap-1">
        <a
          href={props.actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded-full hover:bg-surface/50 transition-colors"
          title="Open Blink Source"
          onClick={(e) => e.stopPropagation()}
        >
          <LuExternalLink className="text-secText" size={12} />
        </a>
      </div>
      <div>
        <span className="text-xs text-secText">
          {actions.length} {actions.length === 1 ? 'action' : 'actions'} ready
        </span>
      </div>
    </>
  );

  const expandedContent = (
    <>
      <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-primary/10">
        <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-lg">
            <LuZap className="text-primary" size={24} />
          </div>
          {title}
        </h2>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            refreshBlinkMetadata();
          }}
          className="p-1.5 rounded-lg hover:bg-surface/50 text-secText"
          title="Refresh Blink Metadata"
        >
          <LuRefreshCw size={15} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {metadata?.icon && (
          <div className="w-full overflow-hidden rounded-lg bg-background flex justify-center max-h-48">
            <img
              src={metadata.icon}
              alt={title}
              className="object-contain max-h-48 rounded-lg"
            />
          </div>
        )}

        <p className="text-sm text-secText leading-relaxed">{description}</p>

        {actions.length > 0 && (
          <div className="flex flex-col gap-3">
            {actions.map((action, idx) => {
              const actionKey = action.href || `${action.label}-${idx}`;
              const actionParams = action.parameters || [];

              return (
                <div
                  key={actionKey}
                  className="bg-background rounded-lg p-3 border border-border flex flex-col gap-2"
                >
                  {actionParams.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {actionParams.map((param) => (
                        <div key={param.name} className="flex flex-col gap-1">
                          <label className="text-xs text-secText">
                            {param.label || param.name}
                            {param.required ? ' *' : ''}
                          </label>
                          <input
                            type="text"
                            placeholder={param.label || param.name}
                            value={
                              paramState[action.href]?.[param.name] ??
                              paramState.default?.[param.name] ??
                              ''
                            }
                            onChange={(e) =>
                              handleParameterChange(
                                action.href,
                                param.name,
                                e.target.value
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded bg-surface/40 border border-border text-sm text-textColor focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isExecuting || metadata?.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateAction(action.href);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <LuPlay size={14} />
                    {isExecuting && activeActionLabel === action.label
                      ? 'Executing...'
                      : action.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {statusMessage && (
          <div className="bg-surface/30 p-3 rounded-lg text-xs text-textColor">
            {statusMessage}
          </div>
        )}

        {txSignature && (
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-secText">Transaction submitted</span>
            <a
              href={`https://solscan.io/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              View on Solscan
              <LuExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </>
  );

  return (
    <BaseExpandableMessageItem
      title="Solana Blink"
      icon={<LuZap className="text-primary" size={16} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
      maxWidth="max-w-lg"
    />
  );
};
