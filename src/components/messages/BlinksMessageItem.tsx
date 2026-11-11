'use client';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import {
  BlinkActionMetadata,
  BlinkExecutionResult,
  BlinkLinkedAction,
} from '@/types/blinks';
import {
  matchBlinkAction,
  resolveBlinkActionHref,
  useBlinksHandler,
} from '@/store/BlinksHandler';
import { useWalletHandler } from '@/store/WalletHandler';

export interface BlinksMessageItemProps {
  props: {
    blinkUrl: string;
    executedHref?: string;
    actionLabel?: string;
    parameters?: Record<string, string | number>;
    handsfree?: boolean;
    autoExecute?: boolean;
    metadata?: BlinkActionMetadata;
    onTransactionReceived?: (
      transactionBase64: string,
      result: BlinkExecutionResult
    ) => void;
  };
}

export const BlinksMessageItem: FC<BlinksMessageItemProps> = ({ props }) => {
  const walletAddress = useWalletHandler(
    (state) => state.currentWallet?.address
  );
  const {
    registerBlinkController,
    unregisterBlinkController,
    setActiveBlink,
    pendingTrigger,
    clearPendingTrigger,
    setLastExecutionResult,
  } = useBlinksHandler();

  const [metadata, setMetadata] = useState<BlinkActionMetadata | null>(
    props.metadata ?? null
  );
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(
    !props.metadata
  );
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (props.parameters) {
      for (const [k, v] of Object.entries(props.parameters)) {
        initial[k] = String(v);
      }
    }
    return initial;
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoTriggeredRef = useRef<boolean>(false);

  /**
   * Custom function 1: Fetch Solana Action / Blink metadata from the endpoint.
   */
  const fetchBlinkMetadata = useCallback(async () => {
    if (props.metadata) {
      setMetadata(props.metadata);
      setActiveBlink(props.blinkUrl, props.metadata);
      return props.metadata;
    }
    setLoadingMetadata(true);
    setErrorMessage(null);
    try {
      const response = await fetch(props.blinkUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load Blink metadata (HTTP ${response.status})`);
      }
      const data = (await response.json()) as BlinkActionMetadata;
      setMetadata(data);
      setActiveBlink(props.blinkUrl, data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      return null;
    } finally {
      setLoadingMetadata(false);
    }
  }, [props.blinkUrl, props.metadata, setActiveBlink]);

  /**
   * Custom function 2: Initiate a specific Blink action href with custom parameters.
   */
  const initiateAction = useCallback(
    async (
      actionHref: string,
      customParams?: Record<string, string | number>,
      labelOverride?: string
    ): Promise<BlinkExecutionResult> => {
      const mergedParams: Record<string, string | number> = {
        ...paramValues,
        ...(props.parameters ?? {}),
        ...(customParams ?? {}),
      };
      const targetUrl = resolveBlinkActionHref(
        props.blinkUrl,
        actionHref,
        mergedParams
      );
      const actionLabel =
        labelOverride || props.actionLabel || metadata?.label || 'Blink Action';

      setExecutingAction(actionHref);
      setErrorMessage(null);
      setStatusMessage(`Initiating "${actionLabel}"...`);

      try {
        const account =
          walletAddress || 'Aw2hhJvjewAcxssyWMzKmFge6jWxEzN6GiFQgyZNKakt';
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ account }),
        });

        if (!response.ok) {
          throw new Error(
            `Blink action POST failed with HTTP ${response.status}`
          );
        }

        const payload = await response.json();
        const result: BlinkExecutionResult = {
          blinkUrl: props.blinkUrl,
          executedHref: targetUrl,
          actionLabel,
          parameters: mergedParams,
          transaction: payload.transaction,
          message: payload.message,
          handsfree: Boolean(props.handsfree),
          status: payload.transaction ? 'completed' : 'initiated',
        };

        setLastExecutionResult(result);
        setStatusMessage(
          payload.message ||
            `Action "${actionLabel}" initiated successfully${
              props.handsfree ? ' (Handsfree)' : ''
            }.`
        );

        if (payload.transaction && props.onTransactionReceived) {
          props.onTransactionReceived(payload.transaction, result);
        }

        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(msg);
        setStatusMessage(null);
        const failedResult: BlinkExecutionResult = {
          blinkUrl: props.blinkUrl,
          executedHref: targetUrl,
          actionLabel,
          parameters: mergedParams,
          handsfree: Boolean(props.handsfree),
          status: 'error',
          error: msg,
        };
        setLastExecutionResult(failedResult);
        return failedResult;
      } finally {
        setExecutingAction(null);
      }
    },
    [
      metadata?.label,
      paramValues,
      props,
      setLastExecutionResult,
      walletAddress,
    ]
  );

  /**
   * Custom function 3: Initiate a Blink action by natural-language label or voice command.
   */
  const initiateByLabel = useCallback(
    async (
      actionLabel: string,
      customParams?: Record<string, string | number>
    ): Promise<BlinkExecutionResult> => {
      const currentMeta = metadata ?? (await fetchBlinkMetadata());
      if (!currentMeta) {
        return {
          blinkUrl: props.blinkUrl,
          executedHref: props.blinkUrl,
          actionLabel,
          handsfree: true,
          status: 'error',
          error: 'Blink metadata unavailable',
        };
      }
      const matched = matchBlinkAction(
        currentMeta,
        props.blinkUrl,
        actionLabel
      );
      return initiateAction(matched.href, customParams, matched.label);
    },
    [fetchBlinkMetadata, initiateAction, metadata, props.blinkUrl]
  );

  useEffect(() => {
    registerBlinkController(props.blinkUrl, {
      initiateAction,
      initiateByLabel,
    });
    return () => {
      unregisterBlinkController(props.blinkUrl);
    };
  }, [
    initiateAction,
    initiateByLabel,
    props.blinkUrl,
    registerBlinkController,
    unregisterBlinkController,
  ]);

  useEffect(() => {
    void fetchBlinkMetadata();
  }, [fetchBlinkMetadata]);

  // Handsfree auto-trigger when initial props or AI tool triggers an action
  useEffect(() => {
    if (!metadata || autoTriggeredRef.current) return;
    if (props.handsfree && props.autoExecute && (props.actionLabel || props.executedHref)) {
      autoTriggeredRef.current = true;
      const matched = matchBlinkAction(
        metadata,
        props.blinkUrl,
        props.actionLabel,
        props.executedHref
      );
      void initiateAction(matched.href, props.parameters, matched.label);
    }
  }, [
    initiateAction,
    metadata,
    props.actionLabel,
    props.autoExecute,
    props.blinkUrl,
    props.executedHref,
    props.handsfree,
    props.parameters,
  ]);

  // Listen for subsequent AI handsfree triggers queued via useBlinksHandler
  useEffect(() => {
    if (
      !pendingTrigger ||
      pendingTrigger.blinkUrl !== props.blinkUrl ||
      !metadata
    ) {
      return;
    }
    const matched = matchBlinkAction(
      metadata,
      props.blinkUrl,
      pendingTrigger.actionLabel,
      pendingTrigger.actionHref
    );
    clearPendingTrigger();
    void initiateAction(
      matched.href,
      pendingTrigger.parameters,
      matched.label
    );
  }, [
    clearPendingTrigger,
    initiateAction,
    metadata,
    pendingTrigger,
    props.blinkUrl,
  ]);

  const actionsList: BlinkLinkedAction[] = useMemo(() => {
    if (!metadata) return [];
    if (metadata.links?.actions && metadata.links.actions.length > 0) {
      return metadata.links.actions;
    }
    return [{ href: props.blinkUrl, label: metadata.label || 'Execute' }];
  }, [metadata, props.blinkUrl]);

  const footer = (
    <div className="flex items-center justify-between text-xs text-secText">
      <span>
        {props.handsfree
          ? 'Handsfree Blink Mode Active — Voice & AI actions enabled'
          : 'Interactive Solana Blink'}
      </span>
      <span className="truncate max-w-[240px]">{props.blinkUrl}</span>
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title={metadata?.title || 'Solana Blink Action'}
      subtitle={props.actionLabel || 'Handsfree Blockchain Action'}
      footer={footer}
    >
      <div className="flex flex-col gap-3 p-3" data-testid="blinks-message-item">
        {loadingMetadata && (
          <div className="text-sm text-secText">Loading Blink action...</div>
        )}

        {metadata && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              {metadata.icon && (
                <img
                  src={metadata.icon}
                  alt={metadata.title}
                  className="w-14 h-14 rounded-lg object-cover border border-border"
                />
              )}
              <div className="flex flex-col gap-1">
                <p className="text-sm text-textColor">{metadata.description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {actionsList.map((action, idx) => (
                <div
                  key={`${action.href}-${idx}`}
                  className="flex flex-col gap-2 rounded-lg bg-surface p-2"
                >
                  {action.parameters &&
                    action.parameters.map((param) => (
                      <input
                        key={param.name}
                        type="text"
                        placeholder={param.label || param.name}
                        value={paramValues[param.name] ?? ''}
                        onChange={(e) =>
                          setParamValues((prev) => ({
                            ...prev,
                            [param.name]: e.target.value,
                          }))
                        }
                        className="w-full rounded bg-background px-3 py-1.5 text-sm text-textColor border border-border"
                        data-testid={`blink-param-${param.name}`}
                      />
                    ))}
                  <button
                    type="button"
                    disabled={
                      Boolean(metadata.disabled) ||
                      executingAction === action.href
                    }
                    onClick={() =>
                      void initiateAction(
                        action.href,
                        paramValues,
                        action.label
                      )
                    }
                    className="bg-primary hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    data-testid={`blink-action-btn-${idx}`}
                  >
                    {executingAction === action.href
                      ? 'Executing...'
                      : action.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {statusMessage && (
          <div
            className="text-xs text-green-400 font-medium"
            data-testid="blink-status-message"
          >
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div
            className="text-xs text-red-400 font-medium"
            data-testid="blink-error-message"
          >
            {errorMessage}
          </div>
        )}
      </div>
    </BaseBorderedMessageItem>
  );
};
