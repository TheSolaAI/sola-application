'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VersionedTransaction } from '@solana/web3.js';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import {
  BlinkActionMetadata,
  HandsfreeBlinkToolPayload,
  LinkedBlinkAction,
} from '@/config/blinks/games';
import { useWalletHandler } from '@/store/WalletHandler';

interface BlinkMessageItemProps {
  props: HandsfreeBlinkToolPayload;
}

export const BlinkMessageItem: React.FC<BlinkMessageItemProps> = ({ props }) => {
  const { currentWallet } = useWalletHandler();
  const [metadata, setMetadata] = useState<BlinkActionMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(true);
  const [executingHref, setExecutingHref] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (props?.parameters) {
      Object.entries(props.parameters).forEach(([k, v]) => {
        initial[k] = String(v);
      });
    }
    return initial;
  });
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoExecutedRef = useRef<boolean>(false);

  const activeWalletAddress = useMemo(
    () => currentWallet?.address || props.walletAddress || null,
    [currentWallet?.address, props.walletAddress]
  );

  /**
   * Custom Function 1: Fetch Solana Action / Blink metadata from the endpoint
   */
  const fetchBlinkMetadata = useCallback(async (url: string) => {
    setLoadingMetadata(true);
    setErrorMessage(null);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Blink metadata fetch failed (${response.status})`);
      }
      const data: BlinkActionMetadata = await response.json();
      setMetadata(data);
      return data;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load Blink metadata');
      return null;
    } finally {
      setLoadingMetadata(false);
    }
  }, []);

  /**
   * Custom Function 2: Interpolate parameterized href templates (e.g. /api/action?amount={amount})
   */
  const resolveActionEndpoint = useCallback(
    (rawHref: string, customParams: Record<string, string>): string => {
      let resolved = rawHref;
      Object.entries(customParams).forEach(([key, val]) => {
        resolved = resolved.replace(
          new RegExp(`\\{${key}\\}`, 'g'),
          encodeURIComponent(val)
        );
      });
      try {
        return new URL(resolved, props.actionUrl).toString();
      } catch {
        return resolved;
      }
    },
    [props.actionUrl]
  );

  /**
   * Custom Function 3: Initiate a specific Blink action, sign the returned transaction, and broadcast
   */
  const initiateBlinkAction = useCallback(
    async (action: LinkedBlinkAction) => {
      if (!activeWalletAddress || !currentWallet) {
        setErrorMessage('Please connect a Solana wallet to execute this Blink action.');
        return;
      }

      const targetEndpoint = resolveActionEndpoint(action.href, paramValues);
      setExecutingHref(action.href);
      setErrorMessage(null);
      setStatusMessage(`Initiating "${action.label}"...`);

      try {
        const postResp = await fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            account: activeWalletAddress,
          }),
        });

        const payload = await postResp.json();
        if (!postResp.ok || !payload?.transaction) {
          throw new Error(
            payload?.message ||
              payload?.error?.message ||
              `Failed to build Blink transaction (${postResp.status})`
          );
        }

        setStatusMessage('Awaiting wallet signature...');
        const txBytes = Uint8Array.from(atob(payload.transaction), (c) =>
          c.charCodeAt(0)
        );
        const versionedTx = VersionedTransaction.deserialize(txBytes);
        const signedTx = await currentWallet.signTransaction(versionedTx);
        const serializedSigned = Buffer.from(signedTx.serialize()).toString('base64');

        setStatusMessage('Submitting transaction to Solana...');
        const sendResp = await fetch('/api/wallet/sendTransaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serializedTransaction: serializedSigned }),
        });
        const sendData = await sendResp.json();
        if (!sendResp.ok || !sendData?.signature) {
          throw new Error(sendData?.error || 'Transaction submission failed');
        }

        setTxSignature(sendData.signature);
        setStatusMessage(payload?.message || `Completed "${action.label}"!`);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error executing Blink action');
        setStatusMessage(null);
      } finally {
        setExecutingHref(null);
      }
    },
    [activeWalletAddress, currentWallet, paramValues, resolveActionEndpoint]
  );

  /**
   * Custom Function 4: Match action by label or default to the primary Blink action for handsfree execution
   */
  const selectHandsfreeAction = useCallback(
    (data: BlinkActionMetadata): LinkedBlinkAction | null => {
      const actions = data.links?.actions;
      if (!actions || actions.length === 0) {
        return {
          label: data.label || 'Execute Action',
          href: props.actionUrl,
        };
      }
      if (props.actionLabel) {
        const target = props.actionLabel.trim().toLowerCase();
        const matched = actions.find((a) =>
          a.label.toLowerCase().includes(target)
        );
        if (matched) return matched;
      }
      const noRequiredParams = actions.find(
        (a) =>
          !a.parameters ||
          a.parameters.every(
            (p) => !p.required || Boolean(paramValues[p.name])
          )
      );
      return noRequiredParams || actions[0];
    },
    [paramValues, props.actionLabel, props.actionUrl]
  );

  useEffect(() => {
    let active = true;
    fetchBlinkMetadata(props.actionUrl).then((data) => {
      if (!active || !data) return;
      if (
        props.autoExecute &&
        !autoExecutedRef.current &&
        activeWalletAddress &&
        currentWallet
      ) {
        const candidate = selectHandsfreeAction(data);
        if (candidate) {
          autoExecutedRef.current = true;
          initiateBlinkAction(candidate);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [
    activeWalletAddress,
    currentWallet,
    fetchBlinkMetadata,
    initiateBlinkAction,
    props.actionUrl,
    props.autoExecute,
    selectHandsfreeAction,
  ]);

  const actionsList: LinkedBlinkAction[] = useMemo(() => {
    if (!metadata) return [];
    if (metadata.links?.actions && metadata.links.actions.length > 0) {
      return metadata.links.actions;
    }
    return [
      {
        label: metadata.label || 'Execute Blink',
        href: props.actionUrl,
      },
    ];
  }, [metadata, props.actionUrl]);

  return (
    <BaseBorderedMessageItem
      title={metadata?.title || `Solana Blink: ${props.actionName}`}
      subtitle={props.autoExecute ? 'Handsfree Blink Mode' : 'Interactive Blink'}
    >
      <div className="flex flex-col gap-3 text-sm">
        {loadingMetadata && (
          <div className="text-xs opacity-75">Loading Solana Blink metadata...</div>
        )}

        {metadata && (
          <div className="flex flex-col gap-3">
            {metadata.icon && (
              <img
                src={metadata.icon}
                alt={metadata.title}
                className="max-h-48 w-full rounded-lg object-cover"
              />
            )}
            <p className="opacity-85">{metadata.description}</p>

            <div className="flex flex-col gap-2">
              {actionsList.map((act, idx) => (
                <div
                  key={`${act.href}-${idx}`}
                  className="flex flex-col gap-2 rounded-md border border-white/10 p-2"
                >
                  {act.parameters?.map((param) => (
                    <input
                      key={param.name}
                      type="text"
                      placeholder={param.label || param.name}
                      value={paramValues[param.name] || ''}
                      onChange={(e) =>
                        setParamValues((prev) => ({
                          ...prev,
                          [param.name]: e.target.value,
                        }))
                      }
                      className="rounded bg-black/30 px-2 py-1 text-xs outline-none"
                    />
                  ))}
                  <button
                    type="button"
                    disabled={Boolean(executingHref) || metadata.disabled}
                    onClick={() => initiateBlinkAction(act)}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {executingHref === act.href ? 'Executing...' : act.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="text-xs text-emerald-400">{statusMessage}</div>
        )}

        {txSignature && (
          <a
            href={`https://solscan.io/tx/${txSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline text-indigo-400"
          >
            View Transaction on Solscan ({txSignature.slice(0, 8)}...)
          </a>
        )}

        {errorMessage && (
          <div className="text-xs text-red-400">{errorMessage}</div>
        )}
      </div>
    </BaseBorderedMessageItem>
  );
};
