'use client';

import { FC, useState } from 'react';
import { LuExternalLink, LuLoader, LuZap } from 'react-icons/lu';
import { VersionedTransaction } from '@solana/web3.js';
import { toast } from 'sonner';
import { useWalletHandler } from '@/store/WalletHandler';
import { TransactionResponse } from '@/types/response';
import { BlinkLinkedAction } from '@/types/blink';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';

interface BlinkActionData {
  actionUrl: string;
  icon?: string;
  title: string;
  description?: string;
  label?: string;
  actions?: BlinkLinkedAction[];
  executedAction?: string;
  transaction?: string;
  message?: string;
  signAndSend?: boolean;
  requiresActionSelection?: boolean;
  unknownAction?: string;
  selectedAction?: string;
  missingParams?: string[];
}

interface BlinkActionMessageItemProps {
  props: BlinkActionData;
}

export const BlinkActionMessageItem: FC<BlinkActionMessageItemProps> = ({
  props,
}) => {
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  const host = (() => {
    try {
      return new URL(props.actionUrl).hostname;
    } catch {
      return undefined;
    }
  })();

  /**
   * Initiates a blink action without relying on the default blink UI:
   * builds the transaction through the server-side action proxy, signs it
   * with the connected wallet, and sends it to the network.
   */
  const initiateAction = async (action: BlinkLinkedAction) => {
    const wallet = useWalletHandler.getState().currentWallet;
    if (!wallet) {
      toast.error('Please connect your wallet');
      return;
    }

    setPendingLabel(action.label);
    try {
      const buildResponse = await fetch('/api/blinks/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: action.href,
          account: wallet.address,
          params: paramValues,
        }),
      });
      const buildBody = await buildResponse.json();
      if (!buildResponse.ok) {
        throw new Error(buildBody.error || 'Failed to build transaction');
      }

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(buildBody.transaction, 'base64')
      );
      const signedTransaction = await wallet.signTransaction(transaction);

      const sendResponse = await fetch('/api/wallet/sendTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serializedTransaction: Buffer.from(
            signedTransaction.serialize()
          ).toString('base64'),
          options: { skipPreflight: true, maxRetries: 10 },
        }),
      });
      const sendBody: TransactionResponse = await sendResponse.json();
      if (!sendResponse.ok || sendBody.status !== 'success') {
        throw new Error(sendBody.message || 'Transaction failed');
      }

      setSignature(sendBody.txid);
      toast.success(`Blink action "${action.label}" executed`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Blink action failed'
      );
    } finally {
      setPendingLabel(null);
    }
  };

  const compactContent = (
    <div className="flex items-center gap-2">
      <LuZap className="text-primary" size={16} />
      <span className="text-textColor text-sm font-medium">
        {props.title || 'Solana Action'}
      </span>
      {props.executedAction && (
        <span className="text-xs text-secText">
          · {props.executedAction} sent handsfree
        </span>
      )}
    </div>
  );

  const expandedContent = (
    <>
      <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-primary/10">
        <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-lg">
            <LuZap className="text-primary" size={28} />
          </div>
          {props.title || 'Solana Action'}
        </h2>
        {host && (
          <a
            href={`https://${host}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-full hover:bg-surface/50 transition-colors"
            title={host}
            onClick={(e) => e.stopPropagation()}
          >
            <LuExternalLink className="text-secText" size={12} />
          </a>
        )}
      </div>

      <div className="p-4">
        <div className="flex flex-col gap-3 w-full">
          {props.icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.icon}
              alt={props.title || 'blink icon'}
              className="h-16 w-16 rounded-lg object-cover bg-surface/30"
            />
          )}
          {props.description && (
            <p className="text-secText text-sm">{props.description}</p>
          )}
          {props.unknownAction && (
            <p className="text-xs text-secText">
              Unknown action &quot;{props.unknownAction}&quot;. Pick one of the
              actions below.
            </p>
          )}
          {props.missingParams && props.missingParams.length > 0 && (
            <p className="text-xs text-secText">
              Missing parameters: {props.missingParams.join(', ')}
            </p>
          )}

          {(props.actions ?? []).map((action) => (
            <div
              key={`${action.label}-${action.href}`}
              className="bg-surface/30 rounded-lg p-3 flex flex-col gap-2"
            >
              {(action.parameters ?? []).map((parameter) => (
                <input
                  key={parameter.name}
                  className="bg-background rounded-md px-2 py-1 text-sm text-textColor outline-none"
                  placeholder={parameter.label || parameter.name}
                  onChange={(e) =>
                    setParamValues((prev) => ({
                      ...prev,
                      [parameter.name]: e.target.value,
                    }))
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              ))}
              <button
                className="flex items-center justify-center gap-2 rounded-md bg-primary/20 hover:bg-primary/30 transition-colors px-3 py-2 text-sm font-medium text-textColor disabled:opacity-50"
                disabled={pendingLabel !== null}
                onClick={(e) => {
                  e.stopPropagation();
                  initiateAction(action);
                }}
              >
                {pendingLabel === action.label && (
                  <LuLoader className="animate-spin" size={14} />
                )}
                {action.label}
              </button>
            </div>
          ))}

          {signature && (
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              View transaction on Solscan <LuExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </>
  );

  return (
    <BaseExpandableMessageItem
      title={props.title || 'Solana Action'}
      compactContent={compactContent}
      expandedContent={expandedContent}
      initialExpanded={props.requiresActionSelection ?? false}
    />
  );
};
