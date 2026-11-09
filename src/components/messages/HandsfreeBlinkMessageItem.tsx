'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  BlinkActionMetadata,
  LinkedBlinkAction,
  resolveBlinkActionHref,
} from '@/tools/blinksToolSet/executeBlinkAction';

export interface HandsfreeBlinkMessageProps {
  actionUrl: string;
  targetEndpoint?: string;
  metadata: BlinkActionMetadata;
  selectedAction?: LinkedBlinkAction;
  parameters?: Record<string, string | number>;
  transaction?: string;
  message?: string;
  autoExecute?: boolean;
  account?: string;
  onTransactionReady?: (
    serializedTx: string,
    action: LinkedBlinkAction
  ) => void;
}

export const HandsfreeBlinkMessageItem: React.FC<{
  props: HandsfreeBlinkMessageProps;
}> = ({ props }) => {
  const {
    actionUrl,
    metadata,
    selectedAction,
    parameters = {},
    transaction,
    message,
    autoExecute = false,
    account,
    onTransactionReady,
  } = props;

  const [status, setStatus] = useState<'idle' | 'executing' | 'ready' | 'error'>(
    transaction ? 'ready' : 'idle'
  );
  const [activeTx, setActiveTx] = useState<string | undefined>(transaction);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  const initiateBlinkAction = useCallback(
    async (
      action: LinkedBlinkAction,
      actionParams: Record<string, string | number> = parameters
    ) => {
      try {
        setStatus('executing');
        setErrorText(undefined);
        const endpoint = resolveBlinkActionHref(
          actionUrl,
          action.href,
          actionParams
        );
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ account: account || '' }),
        });

        if (!res.ok) {
          throw new Error(`Blink endpoint returned HTTP ${res.status}`);
        }
        const payload = await res.json();
        if (!payload?.transaction) {
          throw new Error('Missing serialized transaction in Blink response');
        }
        setActiveTx(payload.transaction);
        setStatus('ready');
        onTransactionReady?.(payload.transaction, action);
        return payload.transaction as string;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to initiate Blink action';
        setErrorText(msg);
        setStatus('error');
        return undefined;
      }
    },
    [account, actionUrl, onTransactionReady, parameters]
  );

  useEffect(() => {
    if (transaction && selectedAction) {
      onTransactionReady?.(transaction, selectedAction);
    } else if (autoExecute && selectedAction && !transaction && account) {
      void initiateBlinkAction(selectedAction, parameters);
    }
  }, [
    account,
    autoExecute,
    initiateBlinkAction,
    onTransactionReady,
    parameters,
    selectedAction,
    transaction,
  ]);

  const actions =
    metadata?.links?.actions && metadata.links.actions.length > 0
      ? metadata.links.actions
      : [
          {
            label: metadata?.label || 'Execute Blink',
            href: actionUrl,
          },
        ];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-zinc-100 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-white">
            {metadata?.title || 'Solana Blink Action'}
          </h4>
          <p className="mt-1 text-xs text-zinc-400">
            {metadata?.description || actionUrl}
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          Hands-Free Blink
        </span>
      </div>

      {message && (
        <p className="mt-2 text-xs text-emerald-300">{message}</p>
      )}

      {errorText && (
        <p className="mt-2 text-xs text-red-400">Error: {errorText}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((act, idx) => {
          const isSelected = selectedAction?.label === act.label;
          return (
            <button
              key={`${act.label}-${idx}`}
              type="button"
              onClick={() => void initiateBlinkAction(act, parameters)}
              disabled={status === 'executing'}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              {act.label}
            </button>
          );
        })}
      </div>

      {activeTx && (
        <div className="mt-3 rounded bg-zinc-950/70 p-2 font-mono text-[11px] text-zinc-400">
          Ready TX: {activeTx.slice(0, 36)}...
        </div>
      )}
    </div>
  );
};
