'use client';

import { FC, useEffect, useRef } from 'react';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { useBlinkAction } from '@/hooks/useBlinkAction';
import { LuLoader, LuZap, LuExternalLink, LuCheck, LuX } from 'react-icons/lu';

export type BlinkActionMessageProps = {
  type?: 'blink_action';
  blinkUrl: string;
  originalUrl?: string;
  autoExecute?: boolean;
  note?: string | null;
};

interface RenderBlinksProps {
  props: BlinkActionMessageProps;
}

/**
 * Custom Blink renderer with explicit handlers (load / select / execute / autoExecute)
 * so interactions can be driven handsfree by the AI tool path.
 */
export const RenderBlinks: FC<RenderBlinksProps> = ({ props }) => {
  const {
    state,
    metadata,
    error,
    result,
    selectedAction,
    setSelectedAction,
    loadMetadata,
    executeAction,
    autoExecute,
  } = useBlinkAction();

  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (props.autoExecute) {
      autoExecute(props.blinkUrl).catch(() => {
        /* error surfaced via state */
      });
    } else {
      loadMetadata(props.blinkUrl).catch(() => {
        /* error surfaced via state */
      });
    }
  }, [props.autoExecute, props.blinkUrl, autoExecute, loadMetadata]);

  const statusIcon =
    state === 'executing' || state === 'loading_metadata' ? (
      <LuLoader className="h-5 w-5 animate-spin text-primary" />
    ) : state === 'success' ? (
      <LuCheck className="h-5 w-5 text-green-500" />
    ) : state === 'error' ? (
      <LuX className="h-5 w-5 text-red-500" />
    ) : (
      <LuZap className="h-5 w-5 text-primary" />
    );

  const footer = (
    <div className="text-xs text-secText flex flex-col gap-1">
      <p>
        Handsfree Blink handlers:{' '}
        <code className="text-[10px]">loadMetadata</code>,{' '}
        <code className="text-[10px]">executeAction</code>,{' '}
        <code className="text-[10px]">autoExecute</code>
      </p>
      {props.note && <p>{props.note}</p>}
      {error && <p className="text-red-400">{error}</p>}
      {result?.signature && (
        <a
          className="text-primary inline-flex items-center gap-1"
          href={`https://solscan.io/tx/${result.signature}`}
          target="_blank"
          rel="noreferrer"
        >
          View transaction <LuExternalLink className="h-3 w-3" />
        </a>
      )}
      {result?.message && !result.signature && <p>{result.message}</p>}
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title={metadata?.title || 'Solana Blink Action'}
      subtitle={state}
      icon={statusIcon}
      footer={footer}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-secText">
          {metadata?.description ||
            'Custom Blink UI — actions can run without the default Dialect click path.'}
        </p>

        <div className="text-xs break-all text-secText bg-surface/40 rounded p-2">
          {props.blinkUrl}
        </div>

        {metadata?.links?.actions && metadata.links.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {metadata.links.actions.map((action) => (
              <button
                key={`${action.label}-${action.href}`}
                type="button"
                onClick={() => setSelectedAction(action)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  selectedAction?.href === action.href
                    ? 'border-primary bg-primary/20 text-textColor'
                    : 'border-border bg-surface text-secText hover:border-primary/40'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadMetadata(props.blinkUrl)}
            className="px-3 py-2 rounded-lg bg-surface hover:bg-surfaceHover text-textColor text-sm"
            disabled={state === 'loading_metadata' || state === 'executing'}
          >
            Reload metadata
          </button>
          <button
            type="button"
            onClick={() => executeAction(props.blinkUrl)}
            className="px-3 py-2 rounded-lg bg-primary/80 hover:bg-primary text-white text-sm"
            disabled={state === 'loading_metadata' || state === 'executing'}
          >
            Execute selected
          </button>
          <button
            type="button"
            onClick={() => autoExecute(props.blinkUrl)}
            className="px-3 py-2 rounded-lg bg-primary text-white text-sm inline-flex items-center gap-1"
            disabled={state === 'loading_metadata' || state === 'executing'}
          >
            <LuZap className="h-4 w-4" /> Handsfree auto-execute
          </button>
        </div>
      </div>
    </BaseBorderedMessageItem>
  );
};
