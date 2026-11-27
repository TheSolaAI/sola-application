'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  BlinkExecutionRequest,
  BlinkExecutionResponse,
  BlinkLinkedAction,
  BlinkMetadata,
  handsfreeBlinkRegistry,
  matchBlinkAction,
  resolveBlinkActionHref,
} from '@/lib/blinks/handsfreeBlinkRegistry';

export interface HandsfreeBlinkCardProps {
  blinkId: string;
  actionUrl: string;
  walletPublicKey?: string;
  onSignTransaction?: (serializedBase64Tx: string) => Promise<string>;
  onActionResult?: (result: BlinkExecutionResponse) => void;
}

/**
 * Custom functional React component for rendering Solana Blinks with
 * handsfree custom action functions callable both by click and by Sola AI tools.
 */
export const HandsfreeBlinkCard: React.FC<HandsfreeBlinkCardProps> = ({
  blinkId,
  actionUrl,
  walletPublicKey,
  onSignTransaction,
  onActionResult,
}) => {
  const [metadata, setMetadata] = useState<BlinkMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [executing, setExecuting] = useState<boolean>(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMessage('');
    fetch(actionUrl, { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch Blink (${res.status})`);
        return res.json() as Promise<BlinkMetadata>;
      })
      .then((data) => {
        if (active) setMetadata(data);
      })
      .catch((err) => {
        if (active) setErrorMessage(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [actionUrl]);

  const executeBlinkAction = useCallback(
    async (req: BlinkExecutionRequest): Promise<BlinkExecutionResponse> => {
      if (!metadata) {
        return {
          ok: false,
          actionLabel: req.actionLabel || '',
          resolvedHref: actionUrl,
          error: 'Blink metadata is not loaded yet.',
        };
      }
      const matched = matchBlinkAction(metadata, req.actionLabel);
      if (!matched) {
        return {
          ok: false,
          actionLabel: req.actionLabel || '',
          resolvedHref: actionUrl,
          error: `Action "${req.actionLabel}" not found on Blink "${metadata.title}".`,
        };
      }

      const mergedParams = { ...paramValues, ...(req.parameters || {}) };
      const targetHref = matched.href
        ? resolveBlinkActionHref(actionUrl, matched.href, mergedParams)
        : actionUrl;

      setExecuting(true);
      setErrorMessage('');
      setStatusMessage(`Executing "${matched.label}"...`);

      try {
        const account = req.account || walletPublicKey;
        if (!account) {
          throw new Error('Wallet public key is required to execute Blink action.');
        }

        const resp = await fetch(targetHref, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ account }),
        });

        const body = (await resp.json()) as {
          transaction?: string;
          message?: string;
          error?: string;
        };
        if (!resp.ok || !body.transaction) {
          throw new Error(body.error || body.message || `Action HTTP ${resp.status}`);
        }

        let txSignature = '';
        if (onSignTransaction) {
          txSignature = await onSignTransaction(body.transaction);
        }

        const result: BlinkExecutionResponse = {
          ok: true,
          actionLabel: matched.label,
          resolvedHref: targetHref,
          transaction: body.transaction,
          message:
            body.message ||
            (txSignature ? `Confirmed: ${txSignature}` : 'Transaction prepared.'),
        };
        setStatusMessage(result.message || 'Action completed.');
        onActionResult?.(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(msg);
        const failRes: BlinkExecutionResponse = {
          ok: false,
          actionLabel: matched.label,
          resolvedHref: targetHref,
          error: msg,
        };
        onActionResult?.(failRes);
        return failRes;
      } finally {
        setExecuting(false);
      }
    },
    [actionUrl, metadata, onActionResult, onSignTransaction, paramValues, walletPublicKey]
  );

  // Register custom handsfree handler so AI config tools can trigger this Blink without clicks
  useEffect(() => {
    const unregister = handsfreeBlinkRegistry.register(blinkId, executeBlinkAction);
    return unregister;
  }, [blinkId, executeBlinkAction]);

  if (loading) {
    return <div className="rounded-xl border p-4 text-sm opacity-75">Loading Blink...</div>;
  }

  if (!metadata) {
    return (
      <div className="rounded-xl border border-red-500/40 p-4 text-sm text-red-400">
        {errorMessage || 'Unable to render Blink.'}
      </div>
    );
  }

  const actions: BlinkLinkedAction[] =
    metadata.links?.actions && metadata.links.actions.length > 0
      ? metadata.links.actions
      : [{ label: metadata.label || 'Execute', href: '' }];

  return (
    <div className="rounded-xl border p-4 space-y-3" data-blink-id={blinkId}>
      {metadata.icon && (
        <img
          src={metadata.icon}
          alt={metadata.title}
          className="h-40 w-full rounded-lg object-cover"
        />
      )}
      <div>
        <h3 className="text-base font-semibold">{metadata.title}</h3>
        <p className="text-sm opacity-80">{metadata.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((act) => (
          <div key={act.label} className="flex flex-wrap items-center gap-2">
            {(act.parameters || []).map((p) => (
              <input
                key={p.name}
                type="text"
                placeholder={p.label || p.name}
                value={paramValues[p.name] || ''}
                onChange={(e) =>
                  setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))
                }
                className="rounded-md border px-2 py-1 text-sm"
              />
            ))}
            <button
              type="button"
              disabled={executing || metadata.disabled}
              onClick={() =>
                executeBlinkAction({
                  blinkUrl: actionUrl,
                  actionLabel: act.label,
                  parameters: paramValues,
                })
              }
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {executing ? 'Processing...' : act.label}
            </button>
          </div>
        ))}
      </div>

      {statusMessage && <p className="text-xs text-emerald-400">{statusMessage}</p>}
      {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
    </div>
  );
};
