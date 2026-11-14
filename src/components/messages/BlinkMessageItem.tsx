'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BlinkActionMetadata,
  BlinkExecutionResult,
  BlinkLinkedAction,
  BlinkMessageItemProps,
  HandsfreeBlinkCommand,
} from '@/types/blinks';

export const HANDSFREE_BLINK_EVENT = 'sola:handsfree-blink-action';

/**
 * Normalizes a solana-action: or blink URL into a fetchable Action endpoint URL.
 */
export function resolveBlinkActionUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('solana-action:')) {
    return trimmed.replace(/^solana-action:/, '');
  }
  try {
    const parsed = new URL(trimmed);
    const actionParam = parsed.searchParams.get('action');
    if (actionParam) {
      return decodeURIComponent(actionParam).replace(/^solana-action:/, '');
    }
  } catch {
    // Fallback to raw string if relative
  }
  return trimmed;
}

/**
 * Substitutes parameter placeholders (e.g. {amount}, {choice}) in a Blink action href.
 */
export function buildParameterizedActionHref(
  baseActionUrl: string,
  href: string,
  params: Record<string, string | number | boolean> = {}
): string {
  let resolvedHref = href;
  const remainingQuery: Record<string, string> = {};

  for (const [key, val] of Object.entries(params)) {
    const encoded = encodeURIComponent(String(val));
    const placeholder = `{${key}}`;
    if (resolvedHref.includes(placeholder)) {
      resolvedHref = resolvedHref.split(placeholder).join(encoded);
    } else {
      remainingQuery[key] = String(val);
    }
  }

  const targetUrl = new URL(resolvedHref, resolveBlinkActionUrl(baseActionUrl));
  for (const [k, v] of Object.entries(remainingQuery)) {
    if (!targetUrl.searchParams.has(k)) {
      targetUrl.searchParams.set(k, v);
    }
  }
  return targetUrl.toString();
}

/**
 * Dispatches a handsfree Blink command from voice/AI tools to any mounted BlinkMessageItem.
 */
export function triggerHandsfreeBlinkCommand(command: HandsfreeBlinkCommand): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<HandsfreeBlinkCommand>(HANDSFREE_BLINK_EVENT, {
        detail: command,
      })
    );
  }
}

export const BlinkMessageItem: React.FC<{
  props: BlinkMessageItemProps;
  onTransactionReady?: (txBase64: string, result: BlinkExecutionResult) => void;
}> = ({ props, onTransactionReady }) => {
  const [metadata, setMetadata] = useState<BlinkActionMetadata | null>(
    props.metadata || null
  );
  const [loading, setLoading] = useState<boolean>(!props.metadata);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (props.autoParams) {
      for (const [k, v] of Object.entries(props.autoParams)) {
        initial[k] = String(v);
      }
    }
    return initial;
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(
    props.message || null
  );
  const [txHashOrPayload, setTxHashOrPayload] = useState<string | null>(
    props.transaction || null
  );
  const [errorText, setErrorText] = useState<string | null>(null);
  const autoExecutedRef = useRef<boolean>(false);

  const fetchBlinkMetadata = useCallback(async (urlToFetch: string) => {
    setLoading(true);
    setErrorText(null);
    try {
      const endpoint = resolveBlinkActionUrl(urlToFetch);
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch Blink metadata (${res.status})`);
      }
      const data = (await res.json()) as BlinkActionMetadata;
      setMetadata(data);
      return data;
    } catch (err: any) {
      setErrorText(err?.message || 'Unable to load Solana Blink metadata');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Custom defined function to initiate a Blink action (POST request with user's public key)
   * either handsfree (triggered by AI voice tool) or via UI interaction.
   */
  const initiateBlinkAction = useCallback(
    async (
      actionOrHref?: BlinkLinkedAction | string,
      overrideParams?: Record<string, string | number | boolean>,
      overrideAccount?: string
    ): Promise<BlinkExecutionResult> => {
      const baseEndpoint = resolveBlinkActionUrl(props.actionUrl);
      const mergedParams: Record<string, string | number | boolean> = {
        ...paramValues,
        ...(props.autoParams || {}),
        ...(overrideParams || {}),
      };

      let targetHref = baseEndpoint;
      if (typeof actionOrHref === 'string') {
        const matchedAction = metadata?.links?.actions?.find(
          (a) =>
            a.label.toLowerCase() === actionOrHref.toLowerCase() ||
            a.href === actionOrHref
        );
        targetHref = buildParameterizedActionHref(
          baseEndpoint,
          matchedAction ? matchedAction.href : actionOrHref,
          mergedParams
        );
      } else if (actionOrHref && typeof actionOrHref === 'object') {
        targetHref = buildParameterizedActionHref(
          baseEndpoint,
          actionOrHref.href,
          mergedParams
        );
      } else {
        targetHref = buildParameterizedActionHref(
          baseEndpoint,
          baseEndpoint,
          mergedParams
        );
      }

      const account = overrideAccount || props.account || '';
      setExecutingAction(targetHref);
      setErrorText(null);

      try {
        const response = await fetch(targetHref, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account }),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(
            errBody?.message || `Blink action failed with HTTP ${response.status}`
          );
        }

        const payload = await response.json();
        const result: BlinkExecutionResult = {
          success: true,
          actionUrl: props.actionUrl,
          executedHref: targetHref,
          transaction: payload.transaction,
          message: payload.message,
          metadata: metadata || undefined,
          signAndSend: true,
        };

        if (payload.transaction) {
          setTxHashOrPayload(payload.transaction);
          onTransactionReady?.(payload.transaction, result);
        }
        if (payload.message) {
          setStatusMessage(payload.message);
        }
        return result;
      } catch (err: any) {
        const message = err?.message || 'Failed to execute Blink action';
        setErrorText(message);
        return {
          success: false,
          actionUrl: props.actionUrl,
          executedHref: targetHref,
          error: message,
        };
      } finally {
        setExecutingAction(null);
      }
    },
    [metadata, onTransactionReady, paramValues, props.account, props.actionUrl, props.autoParams]
  );

  useEffect(() => {
    if (!props.metadata && props.actionUrl) {
      fetchBlinkMetadata(props.actionUrl);
    }
  }, [fetchBlinkMetadata, props.actionUrl, props.metadata]);

  useEffect(() => {
    if (
      !autoExecutedRef.current &&
      props.autoExecuteAction &&
      (metadata || props.actionUrl)
    ) {
      autoExecutedRef.current = true;
      initiateBlinkAction(
        props.autoExecuteAction,
        props.autoParams,
        props.account
      );
    }
  }, [
    initiateBlinkAction,
    metadata,
    props.account,
    props.actionUrl,
    props.autoExecuteAction,
    props.autoParams,
  ]);

  useEffect(() => {
    const handleHandsfreeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<HandsfreeBlinkCommand>;
      const detail = customEvent.detail;
      if (!detail) return;
      if (
        detail.actionUrl &&
        resolveBlinkActionUrl(detail.actionUrl) !==
          resolveBlinkActionUrl(props.actionUrl)
      ) {
        return;
      }
      if (detail.params) {
        setParamValues((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(detail.params!)) {
            next[k] = String(v);
          }
          return next;
        });
      }
      if (detail.autoExecute !== false) {
        initiateBlinkAction(
          detail.actionLabelOrHref,
          detail.params,
          detail.account
        );
      }
    };

    window.addEventListener(HANDSFREE_BLINK_EVENT, handleHandsfreeEvent);
    return () => {
      window.removeEventListener(HANDSFREE_BLINK_EVENT, handleHandsfreeEvent);
    };
  }, [initiateBlinkAction, props.actionUrl]);

  const actions: BlinkLinkedAction[] = metadata?.links?.actions?.length
    ? metadata.links.actions
    : metadata
      ? [{ href: resolveBlinkActionUrl(props.actionUrl), label: metadata.label }]
      : [];

  return (
    <div className="my-2 rounded-xl border border-zinc-700/60 bg-zinc-900/90 p-4 text-zinc-100 shadow-lg">
      {loading ? (
        <div className="text-sm text-zinc-400">Loading Solana Blink action...</div>
      ) : (
        <>
          <div className="flex items-start gap-4">
            {metadata?.icon && (
              <img
                src={metadata.icon}
                alt={metadata.title || 'Blink icon'}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
                  {metadata?.title || 'Solana Blink Action'}
                </h3>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  Handsfree Ready
                </span>
              </div>
              {metadata?.description && (
                <p className="mt-1 text-sm text-zinc-300">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>

          {actions.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {actions.map((action, idx) => (
                <div
                  key={`${action.href}-${idx}`}
                  className="flex flex-col gap-2 rounded-lg bg-zinc-800/70 p-3"
                >
                  {action.parameters && action.parameters.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {action.parameters.map((param) => (
                        <input
                          key={param.name}
                          type={param.type === 'number' ? 'number' : 'text'}
                          placeholder={param.label || param.name}
                          value={paramValues[param.name] || ''}
                          onChange={(e) =>
                            setParamValues((prev) => ({
                              ...prev,
                              [param.name]: e.target.value,
                            }))
                          }
                          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={metadata?.disabled || executingAction !== null}
                    onClick={() => initiateBlinkAction(action)}
                    className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {executingAction === action.href
                      ? 'Initiating Blink Action...'
                      : action.label}
                  </button>
                </div>
              ))}
            </div>
          )}

          {statusMessage && (
            <div className="mt-3 rounded-md bg-emerald-950/60 p-2.5 text-xs text-emerald-200">
              {statusMessage}
            </div>
          )}

          {txHashOrPayload && (
            <div className="mt-2 truncate rounded-md bg-zinc-800 p-2 font-mono text-xs text-zinc-300">
              Transaction Ready: {txHashOrPayload.slice(0, 32)}...
            </div>
          )}

          {errorText && (
            <div className="mt-3 rounded-md bg-red-950/60 p-2.5 text-xs text-red-300">
              {errorText}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlinkMessageItem;
