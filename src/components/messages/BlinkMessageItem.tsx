'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VersionedTransaction } from '@solana/web3.js';
import { toast } from 'sonner';
import { LuExternalLink, LuGamepad2, LuPlay, LuRefreshCw } from 'react-icons/lu';
import BaseBorderedMessageItem from './base/BaseBorderedMessageItem';
import { useWalletHandler } from '@/store/WalletHandler';
import {
  BlinkLinkedAction,
  BlinkMetadata,
  BlinkToolPayload,
  matchBlinkLinkedAction,
  resolveBlinkActionHref,
} from '@/config/blinks/games';

interface BlinkMessageItemProps {
  props: BlinkToolPayload;
}

export const BlinkMessageItem: React.FC<BlinkMessageItemProps> = ({
  props,
}) => {
  const [metadata, setMetadata] = useState<BlinkMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(true);
  const [executingAction, setExecutingAction] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] =
    useState<BlinkLinkedAction | null>(null);
  const [paramValues, setParamValues] = useState<
    Record<string, string | number>
  >(props?.parameters || {});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const autoTriggeredRef = useRef<boolean>(false);

  /**
   * Custom function 1: Fetch Solana Action (Blink) metadata from the action endpoint.
   */
  const fetchBlinkMetadata = useCallback(async (url: string) => {
    setLoadingMetadata(true);
    setStatusMessage('');
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch Blink metadata (${response.status})`);
      }
      const data: BlinkMetadata = await response.json();
      setMetadata(data);
      const initialAction = matchBlinkLinkedAction(
        data,
        props?.actionLabel,
        props?.subActionHref
      );
      setSelectedAction(initialAction);
      return data;
    } catch (error) {
      const fallback: BlinkMetadata = {
        icon: '',
        title: `Solana Blink: ${props?.actionName || 'Action'}`,
        description:
          'Interactive Solana Blockchain Action ready for handsfree execution.',
        label: props?.actionLabel || 'Execute Blink Action',
        links: {
          actions: [
            {
              href: url,
              label: props?.actionLabel || 'Execute Action',
            },
          ],
        },
      };
      setMetadata(fallback);
      setSelectedAction(fallback.links?.actions[0] || null);
      console.error('Blink metadata load fallback:', error);
      return fallback;
    } finally {
      setLoadingMetadata(false);
    }
  }, [props?.actionLabel, props?.actionName, props?.subActionHref]);

  /**
   * Custom function 2: Programmatically update Blink action parameters (handsfree input setter).
   */
  const setBlinkParameter = useCallback(
    (name: string, value: string | number) => {
      setParamValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  /**
   * Custom function 3: Programmatically select a linked Blink action by label or href.
   */
  const selectBlinkAction = useCallback(
    (actionLabel?: string, subActionHref?: string) => {
      if (!metadata) return null;
      const matched = matchBlinkLinkedAction(
        metadata,
        actionLabel,
        subActionHref
      );
      if (matched) {
        setSelectedAction(matched);
      }
      return matched;
    },
    [metadata]
  );

  /**
   * Custom function 4: Initiate the Solana Blink Action POST request, sign, and broadcast transaction.
   */
  const initiateBlinkAction = useCallback(
    async (
      targetAction?: BlinkLinkedAction | null,
      overrideParams?: Record<string, string | number>
    ) => {
      const actionToRun = targetAction || selectedAction;
      const activeParams = { ...paramValues, ...(overrideParams || {}) };
      const currentWallet = useWalletHandler.getState().currentWallet;

      if (!currentWallet?.address) {
        const msg = 'Connect a Solana wallet to execute this Blink action.';
        setStatusMessage(msg);
        toast.error(msg);
        return { success: false, error: msg };
      }

      const rawHref = actionToRun?.href || props.actionUrl;
      const endpointUrl = resolveBlinkActionHref(
        props.actionUrl,
        rawHref,
        activeParams
      );

      setExecutingAction(true);
      setStatusMessage(
        `Initiating "${actionToRun?.label || props.actionName}"...`
      );

      try {
        const postResponse = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            account: currentWallet.address,
            data: activeParams,
          }),
        });

        const payload = await postResponse.json();
        if (!postResponse.ok || !payload?.transaction) {
          throw new Error(
            payload?.message ||
              payload?.error ||
              'Blink endpoint did not return a signable transaction.'
          );
        }

        const txBuffer = Buffer.from(payload.transaction, 'base64');
        const transaction = VersionedTransaction.deserialize(txBuffer);
        const signedTx = await currentWallet.signTransaction(transaction);
        const serializedTx = Buffer.from(signedTx.serialize()).toString(
          'base64'
        );

        const sendResponse = await fetch('/api/wallet/sendTransaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serializedTransaction: serializedTx,
            options: { skipPreflight: true, maxRetries: 10 },
          }),
        });

        const sendData = await sendResponse.json();
        if (!sendResponse.ok) {
          throw new Error(sendData?.error || 'Failed to broadcast Blink tx');
        }

        const sig =
          sendData?.signature || sendData?.txid || sendData?.transactionHash;
        if (sig) {
          setTxSignature(String(sig));
        }
        const completeMsg =
          payload.message ||
          `Successfully executed Blink action "${actionToRun?.label || props.actionName}"!`;
        setStatusMessage(completeMsg);
        toast.success(completeMsg);
        return { success: true, signature: sig };
      } catch (error: any) {
        const errMsg =
          error?.message || 'Unable to complete Blink action execution.';
        setStatusMessage(errMsg);
        toast.error(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setExecutingAction(false);
      }
    },
    [paramValues, props.actionName, props.actionUrl, selectedAction]
  );

  // Load Blink metadata on mount
  useEffect(() => {
    if (props?.actionUrl) {
      fetchBlinkMetadata(props.actionUrl);
    }
  }, [fetchBlinkMetadata, props?.actionUrl]);

  // Handsfree auto-execution when triggered by AI tool with autoExecute / execute command
  useEffect(() => {
    if (
      !loadingMetadata &&
      metadata &&
      !autoTriggeredRef.current &&
      (props?.autoExecute || props?.command === 'execute')
    ) {
      autoTriggeredRef.current = true;
      const target = matchBlinkLinkedAction(
        metadata,
        props.actionLabel,
        props.subActionHref
      );
      if (target) {
        setSelectedAction(target);
      }
      initiateBlinkAction(target, props.parameters);
    }
  }, [
    initiateBlinkAction,
    loadingMetadata,
    metadata,
    props?.actionLabel,
    props?.autoExecute,
    props?.command,
    props?.parameters,
    props?.subActionHref,
  ]);

  // Listen for live handsfree voice/AI commands dispatched via window event
  useEffect(() => {
    const handleHandsfreeEvent = (event: Event) => {
      const customEvent = event as CustomEvent<BlinkToolPayload>;
      const detail = customEvent.detail;
      if (!detail || detail.actionName !== props.actionName) return;

      if (detail.parameters) {
        Object.entries(detail.parameters).forEach(([k, v]) =>
          setBlinkParameter(k, v)
        );
      }
      const matched = selectBlinkAction(
        detail.actionLabel,
        detail.subActionHref
      );
      if (detail.command === 'execute' || detail.autoExecute) {
        initiateBlinkAction(matched, detail.parameters);
      }
    };

    window.addEventListener('sola:blink-command', handleHandsfreeEvent);
    return () => {
      window.removeEventListener('sola:blink-command', handleHandsfreeEvent);
    };
  }, [
    initiateBlinkAction,
    props.actionName,
    selectBlinkAction,
    setBlinkParameter,
  ]);

  const actions = metadata?.links?.actions || [];

  const footer = (
    <div className="flex items-center justify-between text-xs text-secText">
      <span>
        Mode: {props?.autoExecute ? 'Handsfree Auto-Trigger' : 'Interactive'}
      </span>
      <a
        href={props?.actionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-primary hover:underline"
      >
        <span>Action Endpoint</span>
        <LuExternalLink size={12} />
      </a>
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title={metadata?.title || `Solana Blink: ${props?.actionName}`}
      subtitle={props?.actionName?.toUpperCase()}
      icon={<LuGamepad2 className="text-primary" size={18} />}
      footer={footer}
    >
      <div className="flex flex-col gap-3">
        {metadata?.icon && (
          <img
            src={metadata.icon}
            alt={metadata.title}
            className="w-full max-h-48 object-cover rounded-lg border border-border"
          />
        )}

        <p className="text-sm text-secText">
          {metadata?.description || 'Loading Solana Blink action details...'}
        </p>

        {/* Render dynamic parameters for the currently selected action */}
        {selectedAction?.parameters && selectedAction.parameters.length > 0 && (
          <div className="flex flex-col gap-2 bg-background p-3 rounded-lg border border-border">
            {selectedAction.parameters.map((param) => (
              <div key={param.name} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-secText">
                  {param.label || param.name}
                </label>
                {param.options && param.options.length > 0 ? (
                  <select
                    value={String(paramValues[param.name] ?? '')}
                    onChange={(e) =>
                      setBlinkParameter(param.name, e.target.value)
                    }
                    className="bg-surface text-textColor text-sm rounded-md px-2 py-1.5 border border-border"
                  >
                    <option value="">Select {param.label || param.name}</option>
                    {param.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder={param.label || param.name}
                    value={String(paramValues[param.name] ?? '')}
                    onChange={(e) =>
                      setBlinkParameter(param.name, e.target.value)
                    }
                    className="bg-surface text-textColor text-sm rounded-md px-2 py-1.5 border border-border"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {actions.map((act, idx) => {
            const isSelected = selectedAction?.href === act.href;
            return (
              <button
                key={`${act.href}-${idx}`}
                disabled={executingAction || loadingMetadata}
                onClick={() => {
                  setSelectedAction(act);
                  initiateBlinkAction(act);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isSelected
                    ? 'bg-primary text-textColorContrast'
                    : 'bg-surface text-textColor hover:bg-primary/20'
                }`}
              >
                {executingAction && isSelected ? (
                  <LuRefreshCw className="animate-spin" size={14} />
                ) : (
                  <LuPlay size={14} />
                )}
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {statusMessage && (
          <div className="text-xs bg-background p-2.5 rounded-lg border border-border text-textColor">
            {statusMessage}
          </div>
        )}

        {txSignature && (
          <a
            href={`https://solscan.io/tx/${txSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <span>View Transaction on Solscan</span>
            <LuExternalLink size={12} />
          </a>
        )}
      </div>
    </BaseBorderedMessageItem>
  );
};
