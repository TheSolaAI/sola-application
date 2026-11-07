'use client';

import React from 'react';
import { Card } from '@/components/common/Card';
import {
  useAlphalineWss,
  UseAlphalineWssOptions,
} from '@/hooks/useAlphalineWss';
import { AlphalineConnectionStatus } from '@/types/alphaline';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/formatNumber';

export interface AlphalineDataDisplayProps extends UseAlphalineWssOptions {
  title?: string;
  className?: string;
}

const STATUS_BADGE_STYLES: Record<
  AlphalineConnectionStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  idle: {
    label: 'Idle',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  connecting: {
    label: 'Connecting',
    dotClass: 'bg-amber-400 animate-pulse',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  connected: {
    label: 'Live WSS',
    dotClass: 'bg-emerald-400 animate-pulse',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  reconnecting: {
    label: 'Reconnecting',
    dotClass: 'bg-amber-400 animate-ping',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  disconnected: {
    label: 'Disconnected',
    dotClass: 'bg-gray-500',
    badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  error: {
    label: 'Error',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

export const AlphalineDataDisplay: React.FC<AlphalineDataDisplayProps> = ({
  title = 'Alphaline Live Feed',
  className,
  ...wssOptions
}) => {
  const {
    status,
    items,
    metrics,
    error,
    latencyMs,
    endpointUrl,
    connect,
    disconnect,
  } = useAlphalineWss(wssOptions);

  const badge = STATUS_BADGE_STYLES[status] ?? STATUS_BADGE_STYLES.idle;
  const isConnected = status === 'connected' || status === 'connecting';

  return (
    <Card className={cn('p-4 flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-textColor">{title}</h3>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                badge.badgeClass
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', badge.dotClass)} />
              {badge.label}
              {latencyMs !== null && status === 'connected' && (
                <span className="opacity-75">({latencyMs}ms)</span>
              )}
            </span>
          </div>
          {endpointUrl && (
            <span className="text-xs text-secText font-mono truncate max-w-xs sm:max-w-md">
              {endpointUrl}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={isConnected ? disconnect : connect}
          className="rounded-md border border-border bg-primary/10 px-3 py-1 text-xs font-medium text-textColor hover:bg-primary/20 transition-colors"
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400"
        >
          {error}
        </div>
      )}

      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-md border border-border bg-background/40 p-2.5">
            <p className="text-[11px] text-secText">Active Campaigns</p>
            <p className="text-sm font-semibold text-textColor">
              {metrics.activeCampaigns}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background/40 p-2.5">
            <p className="text-[11px] text-secText">Total Volume</p>
            <p className="text-sm font-semibold text-textColor">
              ${formatNumber(metrics.totalVolumeUsd)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background/40 p-2.5">
            <p className="text-[11px] text-secText">Rewards Distributed</p>
            <p className="text-sm font-semibold text-textColor">
              ${formatNumber(metrics.totalRewardsDistributedUsd)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background/40 p-2.5">
            <p className="text-[11px] text-secText">Participants</p>
            <p className="text-sm font-semibold text-textColor">
              {formatNumber(metrics.activeParticipants)}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-secText">
            {status === 'connected'
              ? 'Listening for live Alphaline events...'
              : 'No Alphaline stream events received yet.'}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/30 px-3 py-2 text-xs"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-textColor truncate">
                    {item.title}
                  </span>
                  {item.protocol && (
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {item.protocol}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-secText">
                  {item.channel}
                  {item.category ? ` • ${item.category}` : ''}
                </span>
              </div>

              {item.rewardAmount !== undefined && (
                <div className="shrink-0 text-right font-semibold text-emerald-400">
                  +{formatNumber(item.rewardAmount)}{' '}
                  {item.rewardToken || 'USDC'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

AlphalineDataDisplay.displayName = 'AlphalineDataDisplay';
