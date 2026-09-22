'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import { VersionedTransaction } from '@solana/web3.js';
import { LuExternalLink, LuZap } from 'react-icons/lu';
import { AiOutlineCheckCircle, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'sonner';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { useWalletHandler } from '@/store/WalletHandler';
import {
  applyActionParameters,
  assertSafeActionUrl,
  resolveActionHref,
} from '@/lib/blinks';
import type { BlinkAction, BlinkActionResultData } from '@/types/blinks';

interface BlinkActionMessageItemProps {
  props: BlinkActionResultData;
}

/**
 * Sola's own Blink (Solana Action) component. It renders a Blink's
 * metadata and exposes its own `triggerAction` function to build, sign
 * and send the action's transaction directly with the connected wallet —
 * instead of the default click-through Blink widget.
 */
export const BlinkActionMessageItem: FC<BlinkActionMessageItemProps> = ({
  props,
}) => {
  const { theme } = useThemeManager();
  const { currentWallet } = useWalletHandler();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [completedHref, setCompletedHref] = useState<string | null>(null);

  /**
   * Custom function to initiate a Blink action: resolves the action's
   * transaction against the provider, then signs and sends it with the
   * connected wallet. This is what lets an action be triggered directly
   * (by a click here, or by Sola AI calling `executeBlinkAction`) rather
   * than through the default Blink widget's own UI flow.
   */
  const triggerAction = async (baseUrl: string, action: BlinkAction) => {
    if (!currentWallet) {
      toast.error('Please connect your wallet to run this Blink action');
      return;
    }

    setPendingHref(action.href);
    try {
      const target = assertSafeActionUrl(
        applyActionParameters(resolveActionHref(baseUrl, action.href))
      );

      const response = await fetch(target.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ account: currentWallet.address }),
      });

      if (!response.ok) {
        throw new Error(`Blink provider responded with status ${response.status}`);
      }

      const body = (await response.json()) as {
        transaction?: string;
        message?: string;
      };

      if (!body.transaction) {
        throw new Error('Blink provider did not return a transaction to sign');
      }

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(body.transaction, 'base64')
      );
      const signedTransaction = await currentWallet.signTransaction(transaction);

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

      const sendResult = await sendResponse.json();
      if (!sendResponse.ok) {
        throw new Error(sendResult?.message ?? 'Failed to send the transaction');
      }

      toast.success(body.message ?? `${action.label} completed`);
      setCompletedHref(action.href);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to run the Blink action'
      );
    } finally {
      setPendingHref(null);
    }
  };

  const icon = (
    <div className="bg-primary/10 p-1 rounded-lg overflow-hidden w-7 h-7 flex items-center justify-center">
      {props.kind === 'metadata' && props.icon ? (
        <Image
          src={props.icon}
          alt={props.title}
          width={28}
          height={28}
          className="object-cover w-full h-full"
        />
      ) : (
        <LuZap className="text-primary" size={20} />
      )}
    </div>
  );

  if (props.kind === 'prepared') {
    return (
      <BaseBorderedMessageItem title={props.actionLabel} icon={icon}>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AiOutlineCheckCircle className="text-green-500" size={20} />
            <p className="text-green-500 text-sm font-medium">
              Blink action prepared — signing and sending automatically
            </p>
          </div>
          {props.message && (
            <p className="text-secText text-xs mt-1">{props.message}</p>
          )}
        </div>
      </BaseBorderedMessageItem>
    );
  }

  return (
    <BaseBorderedMessageItem title={props.title} icon={icon}>
      <div className="flex flex-col gap-3">
        {props.description && (
          <p className="text-textColor text-sm">{props.description}</p>
        )}

        {props.disabled ? (
          <p className="text-secText text-sm italic">
            This Blink is currently disabled by its provider.
          </p>
        ) : (
          <div className="flex flex-row flex-wrap gap-2">
            {props.actions.map((action) => {
              const isPending = pendingHref === action.href;
              const isDone = completedHref === action.href;
              return (
                <Pill
                  key={action.href}
                  text={
                    isPending
                      ? 'Running…'
                      : isDone
                        ? `${action.label} ✓`
                        : action.label
                  }
                  color={theme.primary}
                  textColor={theme.background}
                  icon={
                    isPending ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : undefined
                  }
                  hoverable={!isPending}
                  onClick={() => {
                    if (!isPending) {
                      void triggerAction(props.url, action);
                    }
                  }}
                />
              );
            })}
          </div>
        )}

        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secText text-xs flex items-center gap-1 hover:text-primary"
        >
          <LuExternalLink size={12} />
          {props.url}
        </a>
      </div>
    </BaseBorderedMessageItem>
  );
};
