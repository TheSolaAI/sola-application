'use client';

import { FC } from 'react';
import { LuCoins, LuExternalLink, LuEye } from 'react-icons/lu';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { nativeStakingViewDataSchema } from '@sola-labs/ai-kit';
import type { NativeStakingViewData, NativeStakeInfo } from '@sola-labs/ai-kit';

interface ViewStakesMessageItemProps {
  props: NativeStakingViewData;
}

export const ViewStakesMessageItem: FC<ViewStakesMessageItemProps> = ({
  props,
}) => {
  // Validate props at runtime
  const validationResult = nativeStakingViewDataSchema.safeParse(props);
  if (!validationResult.success) {
    console.error(
      'Invalid props for ViewStakesMessageItem:',
      validationResult.error
    );
    return (
      <BaseBorderedMessageItem
        title="Staking Overview"
        icon={
          <div className="bg-primary/10 p-1 rounded-lg">
            <LuEye className="text-primary" size={28} />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-500 text-sm font-medium">Error</p>
            <p className="text-textColor text-xs mt-1">
              Failed to load staking data. Please try again later.
            </p>
          </div>
        </div>
      </BaseBorderedMessageItem>
    );
  }

  const { stakes, totalStaked } = validationResult.data;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'inactive':
        return 'text-gray-500';
      default:
        return 'text-secText';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Compact content for dashboard view
  const compactContent = (
    <div className="flex items-center gap-2">
      <LuEye className="text-primary" size={16} />
      <span className="text-textColor text-sm font-medium">
        {stakes.length} Stakes • {totalStaked.toFixed(2)} SOL
      </span>
    </div>
  );

  // Compact footer
  const compactFooter = (
    <div className="flex justify-between items-center">
      <div>
        <span className="text-xs text-secText">
          Total: {props.totalStaked.toFixed(2)} SOL
        </span>
      </div>
    </div>
  );

  // If dashboard is open, show compact view
  if (dashboardOpen) {
    return (
      <BaseExpandableMessageItem
        title="Staking Overview"
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
        text={`${stakes.length} Stakes`}
        color={theme.sec_background}
        textColor={theme.secText}
        icon={<LuCoins size={20} />}
        hoverable={false}
      />
      <Pill
        text={`${totalStaked.toFixed(2)} SOL Total`}
        color={theme.sec_background}
        textColor={theme.secText}
        icon={<LuCoins size={20} />}
        hoverable={false}
      />
    </div>
  );

  const icon = (
    <div className="bg-primary/10 p-1 rounded-lg">
      <LuEye className="text-primary" size={28} />
    </div>
  );

  // No stakes case
  if (stakes.length === 0) {
    return (
      <BaseBorderedMessageItem
        title="Staking Overview"
        icon={icon}
        footer={footer}
      >
        <div className="flex flex-col gap-4">
          <div className="bg-surface/20 border border-border rounded-lg p-4 text-center">
            <LuCoins className="text-secText mx-auto mb-2" size={32} />
            <p className="text-textColor text-sm font-medium">
              No Active Stakes
            </p>
            <p className="text-secText text-xs mt-1">
              You don't have any active SOL stakes yet. Use the staking tool to
              start earning rewards.
            </p>
          </div>
        </div>
      </BaseBorderedMessageItem>
    );
  }

  return (
    <BaseBorderedMessageItem
      title="Staking Overview"
      subtitle={`${stakes.length} stakes`}
      icon={icon}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Total Staked</p>
            <p className="text-textColor text-xl font-bold">
              {totalStaked.toFixed(2)} SOL
            </p>
          </div>

          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Active Stakes</p>
            <p className="text-textColor text-xl font-bold">
              {
                stakes.filter((s: NativeStakeInfo) => s.status === 'active')
                  .length
              }
            </p>
          </div>

          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Pending Stakes</p>
            <p className="text-textColor text-xl font-bold">
              {
                stakes.filter((s: NativeStakeInfo) => s.status === 'pending')
                  .length
              }
            </p>
          </div>
        </div>

        {/* Stakes list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {stakes.map((stake: NativeStakeInfo, index: number) => (
            <div
              key={index}
              className="bg-surface/30 p-4 rounded-lg hover:bg-surface/50 transition-colors"
            >
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusDot(stake.status)}`}
                    ></div>
                    <span
                      className={`text-sm font-medium capitalize ${getStatusColor(stake.status)}`}
                    >
                      {stake.status}
                    </span>
                  </div>
                  <div className="text-textColor text-lg font-bold">
                    {stake.amount.toFixed(2)} SOL
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-secText">Stake Account:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-mono text-textColor">
                        {getAbbreviatedAddress(stake.stakeAccount)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(stake.stakeAccount, 'Stake account');
                        }}
                        className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                        title="Copy stake account"
                      >
                        <FiCopy className="text-secText" size={12} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-secText">Validator:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-mono text-textColor">
                        {getAbbreviatedAddress(stake.validator)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(stake.validator, 'Validator address');
                        }}
                        className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                        title="Copy validator address"
                      >
                        <FiCopy className="text-secText" size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <a
                    href={`https://solscan.io/account/${stake.stakeAccount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Stake Account
                    <LuExternalLink className="ml-1" size={12} />
                  </a>

                  <span className="text-secText">•</span>

                  <a
                    href={`https://solscan.io/account/${stake.validator}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Validator
                    <LuExternalLink className="ml-1" size={12} />
                  </a>

                  {stake.epoch && (
                    <>
                      <span className="text-secText">•</span>
                      <span className="text-xs text-secText">
                        Epoch: {stake.epoch}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-500 text-sm font-medium">Staking Info</p>
          <p className="text-textColor text-xs mt-1">
            Active stakes are earning rewards. Pending stakes will become active
            in the next epoch. Use the stake status tool to check detailed
            information about each stake.
          </p>
        </div>
      </div>
    </BaseBorderedMessageItem>
  );
};
