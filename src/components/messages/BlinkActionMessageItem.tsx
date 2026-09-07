'use client';

import { FC } from 'react';
import {
  LuBolt,
  LuCheck,
  LuExternalLink,
  LuLoader,
  LuPlay,
  LuRefreshCw,
  LuX,
} from 'react-icons/lu';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { BlinkParameterFields } from './blinks/BlinkParameterFields';
import { useBlinkAction } from '@/hooks/useBlinkAction';
import { sanitizeHttpUrl } from '@/lib/blinks/spec';
import type { BlinkToolData } from '@/types/blink';

interface BlinkActionMessageItemProps {
  props: BlinkToolData;
}

export const BlinkActionMessageItem: FC<BlinkActionMessageItemProps> = ({
  props,
}) => {
  const {
    metadata,
    status,
    statusText,
    error,
    signature,
    resultMessage,
    externalLink,
    actions,
    selectedAction,
    params,
    readyToExecute,
    setParam,
    executeBlinkAction,
    retry,
  } = useBlinkAction(props);

  const busy = status === 'loading' || status === 'signing';
  const iconUrl = sanitizeHttpUrl(metadata?.icon);
  const cardStatus =
    status === 'ready'
      ? 'default'
      : status === 'loading' || status === 'signing'
        ? 'pending'
        : status;

  const statusIcon =
    status === 'success' ? (
      <LuCheck className="text-green-500" size={22} />
    ) : status === 'error' ? (
      <LuX className="text-red-500" size={22} />
    ) : busy ? (
      <LuLoader className="text-primary animate-spin" size={22} />
    ) : (
      <LuBolt className="text-primary" size={22} />
    );

  const footer = (
    <div className="flex justify-between items-center gap-3 text-xs text-secText">
      <span>
        {status === 'success'
          ? resultMessage || 'Blink action completed.'
          : props.autoExecute
            ? 'Sola will run this Blink with your wallet signature — no Dialect renderer.'
            : 'Custom Sola handlers run this Blink without the default renderer.'}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {status === 'error' && (
          <button
            type="button"
            onClick={() => retry().catch(() => undefined)}
            className="text-primary hover:text-primary/80 transition flex items-center gap-1"
          >
            <LuRefreshCw size={12} /> Retry
          </button>
        )}
        {signature && (
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition flex items-center gap-1"
          >
            Explorer <LuExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );

  return (
    <BaseStatusMessageItem
      title={metadata?.title || props.title || 'Blink Action'}
      status={cardStatus}
      statusText={
        props.autoExecute && status === 'ready' ? 'Handsfree ready' : statusText
      }
      icon={statusIcon}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {iconUrl && (
            // Arbitrary Blink hosts; next/image is unnecessary here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconUrl}
              alt={metadata?.title || 'Blink icon'}
              width={56}
              height={56}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover border border-border"
            />
          )}
          <div className="min-w-0 space-y-1">
            {metadata?.description && (
              <p className="text-sm text-secText leading-relaxed">
                {metadata.description}
              </p>
            )}
            <p className="text-xs text-secText break-all">{props.actionUrl}</p>
            {props.autoExecute && (
              <span className="inline-flex items-center rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[11px] font-medium">
                Handsfree
              </span>
            )}
          </div>
        </div>

        {selectedAction?.parameters && (
          <BlinkParameterFields
            parameters={selectedAction.parameters}
            values={params}
            disabled={busy || metadata?.disabled}
            onChange={setParam}
          />
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {externalLink && (
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary"
          >
            Open link <LuExternalLink size={14} />
          </a>
        )}

        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => {
            const isSelected = action === selectedAction;
            return (
              <button
                key={`${index}-${action.href}-${action.label}`}
                type="button"
                onClick={() => executeBlinkAction(action)}
                disabled={
                  busy || metadata?.disabled || (isSelected && !readyToExecute)
                }
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? 'bg-primary text-black hover:bg-primary/90'
                    : 'bg-background text-textColor border border-border hover:bg-surface'
                }`}
              >
                {busy && isSelected ? (
                  <LuLoader className="animate-spin" size={16} />
                ) : (
                  <LuPlay size={16} />
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </BaseStatusMessageItem>
  );
};
