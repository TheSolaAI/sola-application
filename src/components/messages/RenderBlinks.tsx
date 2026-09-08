'use client';

import { FC, useEffect, useRef } from 'react';
import {
  LuCheck,
  LuGamepad2,
  LuLoader,
  LuRefreshCw,
  LuX,
} from 'react-icons/lu';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { useBlinkAction } from '@/hooks/useBlinkAction';
import { BLINKGAMES, BlinkGameName } from '@/store/blinks/games';

interface RenderBlinksProps {
  props: { actionName: string };
}

/**
 * Custom blink renderer. Auto-triggers the Solana Action on mount so
 * voice or text initiated blinks run handsfree without manual clicks.
 */
export const RenderBlinks: FC<RenderBlinksProps> = ({ props }) => {
  const blinkUrl = BLINKGAMES[props.actionName as BlinkGameName];
  const { state, execute } = useBlinkAction(blinkUrl);
  const started = useRef(false);

  useEffect(() => {
    if (!blinkUrl || started.current) return;
    started.current = true;
    execute();
  }, [blinkUrl, execute]);

  if (!blinkUrl) {
    return (
      <BaseStatusMessageItem
        title="Blink"
        status="error"
        statusText="Invalid action"
      >
        <p className="text-secText text-sm">
          Unknown blink game: {props.actionName}
        </p>
      </BaseStatusMessageItem>
    );
  }

  const isBusy = state.status === 'loading' || state.status === 'signing';
  const icon = isBusy ? (
    <LuLoader className="animate-spin" size={24} />
  ) : state.status === 'success' ? (
    <LuCheck className="text-green-500" size={24} />
  ) : (
    <LuX className="text-red-500" size={24} />
  );

  return (
    <BaseStatusMessageItem
      title={state.metadata?.title || 'Blink'}
      status={
        state.status === 'success'
          ? 'success'
          : state.status === 'error'
            ? 'error'
            : 'pending'
      }
      statusText={
        state.status === 'loading'
          ? 'Loading'
          : state.status === 'signing'
            ? 'Confirm in wallet'
            : undefined
      }
      icon={icon}
    >
      <div className="flex items-center gap-3">
        {state.metadata?.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.metadata.icon}
            alt={state.metadata.title || 'blink'}
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-textColor text-sm font-medium">
            <LuGamepad2 size={14} />
            {props.actionName}
          </div>
          {state.metadata?.description && (
            <p className="text-secText text-sm mt-1">
              {state.metadata.description}
            </p>
          )}
          {state.message && (
            <p className="text-secText text-sm mt-1">{state.message}</p>
          )}
          {state.error && (
            <p className="text-red-500 text-sm mt-1">Error: {state.error}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        {state.signature && (
          <a
            href={`https://solscan.io/tx/${state.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition text-sm"
          >
            View on Solscan
          </a>
        )}
        {state.status === 'error' && (
          <button
            onClick={() => {
              started.current = false;
              execute();
            }}
            className="text-xs flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded text-primary transition-colors"
          >
            <LuRefreshCw size={12} /> Retry
          </button>
        )}
      </div>
    </BaseStatusMessageItem>
  );
};
