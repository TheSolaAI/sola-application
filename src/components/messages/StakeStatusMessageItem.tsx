'use client';

import { FC } from 'react';
import { LuCoins, LuExternalLink, LuInfo, LuClock } from 'react-icons/lu';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { useLayoutContext } from '@/providers/LayoutProvider';
import type { StakeStatusResult } from '@/types/staking';

interface StakeStatusMessageItemProps {
  props: StakeStatusResult['data'];
}

export const StakeStatusMessageItem: FC<StakeStatusMessageItemProps> = ({
  props,
}) => {
  const { theme } = useThemeManager();
  const { dashboardOpen } = useLayoutContext();

  const getAbbreviatedAddress = (address: string) => {
    if (!address) return 'Unknown';
    return address.length > 12
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'text-green-500';
      case 'activating':
        return 'text-yellow-500';
      case 'deactivating':
        return 'text-orange-500';
      case 'inactive':
        return 'text-gray-500';
      default:
        return 'text-secText';
    }
  };

  const getStateDot = (state: string) => {
    switch (state) {
      case 'active':
        return 'bg-green-500';
      case 'activating':
        return 'bg-yellow-500';
      case 'deactivating':
        return 'bg-orange-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `~${days}d ${hours}h`;
    return `~${hours}h`;
  };

  // Error state
  if (!props) {
    return (
      <BaseBorderedMessageItem
        title="Stake Status Check Failed"
        icon={
          <div className="bg-red-500/10 p-1 rounded-lg">
            <AiOutlineCloseCircle className="text-red-500" size={28} />
          </div>
        }
      >
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-500 text-sm font-medium">Error</p>
          <p className="text-textColor text-sm mt-1">Invalid stake data</p>
        </div>
      </BaseBorderedMessageItem>
    );
  }

  const data = props;

  // Compact content for dashboard view
  const compactContent = (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStateDot(data.state)}`}></div>
      <span className="text-textColor text-sm font-medium">
        {data.totalAmount.toFixed(2)} SOL • {data.state}
      </span>
    </div>
  );

  // Compact footer
  const compactFooter = (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(data.stakeAccount, 'Stake account');
          }}
          className="p-1 rounded-full hover:bg-surface/50 transition-colors"
          title="Copy stake account"
        >
          <FiCopy className="text-secText" size={12} />
        </button>
        <a
          href={`https://solscan.io/account/${data.stakeAccount}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded-full hover:bg-surface/50 transition-colors"
          title="View on Solscan"
          onClick={(e) => e.stopPropagation()}
        >
          <LuExternalLink className="text-secText" size={12} />
        </a>
      </div>
      <div>
        <span className="text-xs text-secText">Epoch: {data.currentEpoch}</span>
      </div>
    </div>
  );

  // If dashboard is open, show compact view
  if (dashboardOpen) {
    return (
      <BaseExpandableMessageItem
        title="Stake Status"
        compactContent={compactContent}
        expandedContent={<div />}
        footer={compactFooter}
        initialExpanded={false}
      />
    );
  }

  // Full view
  const footer = (
    <div className="flex flex-row gap-x-2 flex-wrap">
      <Pill
        text="View on Solscan"
        color={theme.sec_background}
        textColor={theme.secText}
        icon={<LuExternalLink size={20} />}
        hoverable={true}
        onClick={() => {
          window.open(
            `https://solscan.io/account/${data.stakeAccount}`,
            '_blank'
          );
        }}
      />
    </div>
  );

  const icon = (
    <div className="bg-primary/10 p-1 rounded-lg">
      <LuInfo className="text-primary" size={28} />
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title="Stake Status"
      subtitle={getAbbreviatedAddress(data.stakeAccount)}
      icon={icon}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {/* Status indicator */}
        <div className="bg-surface/30 border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getStateDot(data.state)}`}
            ></div>
            <p
              className={`text-sm font-medium capitalize ${getStateColor(data.state)}`}
            >
              {data.state} Stake
            </p>
          </div>
        </div>

        {/* Main details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Total Amount</p>
            <p className="text-textColor text-xl font-bold">
              {data.totalAmount.toFixed(2)} SOL
            </p>
          </div>

          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Withdrawable</p>
            <p className="text-textColor text-xl font-bold">
              {data.withdrawableAmount.toFixed(2)} SOL
            </p>
            {data.isReadyForWithdrawal && (
              <p className="text-green-500 text-xs mt-1">
                Ready for withdrawal
              </p>
            )}
          </div>
        </div>

        {/* Epoch information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface/30 rounded-lg p-3">
            <p className="text-secText text-sm">Current Epoch</p>
            <p className="text-textColor text-lg font-bold">
              {data.currentEpoch}
            </p>
          </div>

          {data.activationEpoch && (
            <div className="bg-surface/30 rounded-lg p-3">
              <p className="text-secText text-sm">Activation Epoch</p>
              <p className="text-textColor text-lg font-bold">
                {data.activationEpoch}
              </p>
            </div>
          )}

          {data.deactivationEpoch && (
            <div className="bg-surface/30 rounded-lg p-3">
              <p className="text-secText text-sm">Deactivation Epoch</p>
              <p className="text-textColor text-lg font-bold">
                {data.deactivationEpoch}
              </p>
            </div>
          )}
        </div>

        {/* Timing information */}
        {(data.epochsUntilActive ||
          data.epochsUntilInactive ||
          data.estimatedTimeUntilActive ||
          data.estimatedTimeUntilInactive) && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <LuClock className="text-blue-500" size={16} />
              <p className="text-blue-500 text-sm font-medium">
                Timing Information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.epochsUntilActive && (
                <div>
                  <p className="text-secText text-xs">Until Active</p>
                  <p className="text-textColor text-sm">
                    {data.epochsUntilActive} epochs (
                    {formatTime(data.estimatedTimeUntilActive)})
                  </p>
                </div>
              )}

              {data.epochsUntilInactive && (
                <div>
                  <p className="text-secText text-xs">Until Inactive</p>
                  <p className="text-textColor text-sm">
                    {data.epochsUntilInactive} epochs (
                    {formatTime(data.estimatedTimeUntilInactive)})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available actions */}
        {data.availableActions.length > 0 && (
          <div className="bg-surface/20 border border-border rounded-lg p-3">
            <p className="text-secText text-sm font-medium mb-2">
              Available Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {data.availableActions.map((action, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {action.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Account details */}
        <div className="bg-surface/30 p-3 rounded-lg">
          <span className="text-xs text-secText">Stake Account:</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-mono text-textColor break-all pr-2">
              {data.stakeAccount}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(data.stakeAccount, 'Stake account');
              }}
              className="p-1 rounded-full hover:bg-surface/50 flex-shrink-0"
            >
              <FiCopy size={14} className="text-secText" />
            </button>
          </div>
        </div>
      </div>
    </BaseBorderedMessageItem>
  );
};
