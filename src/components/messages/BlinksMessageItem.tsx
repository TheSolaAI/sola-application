'use client';

import { FC, useEffect, useRef } from 'react';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { BlinkRenderResult } from '@/types/blinks';
import { useBlinkAction } from '@/hooks/useBlinkAction';
import {
  LuExternalLink,
  LuRefreshCw,
  LuCheck,
  LuZap,
  LuAlertCircle,
} from 'react-icons/lu';
import { toast } from 'sonner';

interface BlinksMessageItemProps {
  props: BlinkRenderResult;
}

export const BlinksMessageItem: FC<BlinksMessageItemProps> = ({ props }) => {
  const {
    status,
    metadata,
    txHash,
    errorMessage,
    fetchMetadata,
    initiateAction,
  } = useBlinkAction();

  const hasTriggeredRef = useRef(false);

  // Load Blink action metadata on mount
  useEffect(() => {
    if (props.actionUrl) {
      fetchMetadata(props.actionUrl);
    }
  }, [props.actionUrl, fetchMetadata]);

  // Handsfree trigger: automatically execute the default action once metadata is ready
  useEffect(() => {
    if (props.autoTrigger && status === 'ready' && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const defaultHref = metadata?.links?.actions?.[0]?.href;
      initiateAction(props.actionUrl, defaultHref, props.params);
    }
  }, [
    props.autoTrigger,
    status,
    metadata,
    props.actionUrl,
    props.params,
    initiateAction,
  ]);

  const handleCustomAction = (href: string) => {
    initiateAction(props.actionUrl, href, props.params);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'fetching_metadata':
        return (
          <span className="text-xs text-yellow-500 flex items-center gap-1">
            <LuRefreshCw className="animate-spin" size={12} /> Loading Blink...
          </span>
        );
      case 'initiating_action':
        return (
          <span className="text-xs text-primary flex items-center gap-1">
            <LuZap className="animate-pulse" size={12} /> Handsfree: Initiating
            Action...
          </span>
        );
      case 'signing_wallet':
        return (
          <span className="text-xs text-purple-400 flex items-center gap-1">
            <LuRefreshCw className="animate-spin" size={12} /> Awaiting
            Signature...
          </span>
        );
      case 'sending_transaction':
        return (
          <span className="text-xs text-blue-400 flex items-center gap-1">
            <LuRefreshCw className="animate-spin" size={12} /> Broadcasting...
          </span>
        );
      case 'confirming_transaction':
        return (
          <span className="text-xs text-blue-400 flex items-center gap-1">
            <LuRefreshCw className="animate-spin" size={12} /> Confirming on
            Solana...
          </span>
        );
      case 'confirmed':
        return (
          <span className="text-xs text-green-500 flex items-center gap-1">
            <LuCheck size={12} /> Confirmed
          </span>
        );
      case 'error':
        return (
          <span className="text-xs text-red-400 flex items-center gap-1">
            <LuAlertCircle size={12} /> Action Error
          </span>
        );
      default:
        return (
          <span className="text-xs text-secText flex items-center gap-1">
            <LuZap size={12} /> Handsfree Ready
          </span>
        );
    }
  };

  const footer = (
    <div className="flex items-center justify-between text-xs text-secText w-full">
      <div className="flex items-center gap-2">
        <span className="font-medium text-textColor">
          Blink / Solana Action
        </span>
        {txHash && (
          <a
            href={'https://solscan.io/tx/' + txHash}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <span>View on Solscan</span>
            <LuExternalLink size={12} />
          </a>
        )}
      </div>
      <div>{getStatusBadge()}</div>
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title={metadata?.title || props.title || 'Solana Blink Game'}
      subtitle={props.game ? props.game.toUpperCase() : 'HANDSFREE BLINK'}
      icon={<LuZap className="text-primary" size={20} />}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {metadata?.icon && (
            <img
              src={metadata.icon}
              alt={metadata.title || 'Blink'}
              className="w-14 h-14 rounded-lg object-cover border border-border shadow-sm"
            />
          )}
          <div className="flex-1">
            <p className="text-sm text-textColor">
              {metadata?.description ||
                props.description ||
                'Executing handsfree Solana Blink game action...'}
            </p>
            {metadata?.label && (
              <p className="text-xs text-secText mt-1 font-mono">
                Default Action: {metadata.label}
              </p>
            )}
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() =>
                initiateAction(props.actionUrl, undefined, props.params)
              }
              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success confirmation */}
        {txHash && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-green-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuCheck className="text-green-400" size={16} />
              <span>Action completed successfully!</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(txHash);
                toast.success('Transaction hash copied!');
              }}
              className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-300 font-medium transition-colors"
            >
              Copy Hash
            </button>
          </div>
        )}

        {/* Action options if multiple choices exist */}
        {metadata?.links?.actions && metadata.links.actions.length > 1 && (
          <div className="pt-2 border-t border-border flex flex-wrap gap-2">
            {metadata.links.actions.map((act, idx) => (
              <button
                key={idx}
                onClick={() => handleCustomAction(act.href)}
                disabled={
                  status === 'initiating_action' ||
                  status === 'signing_wallet' ||
                  status === 'sending_transaction' ||
                  status === 'confirming_transaction'
                }
                className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </BaseBorderedMessageItem>
  );
};
