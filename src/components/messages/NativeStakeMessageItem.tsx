'use client';

import { FC } from 'react';
import { LuCoins, LuExternalLink } from 'react-icons/lu';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { useLayoutContext } from '@/providers/LayoutProvider';
import type { NativeStakingResult } from '@/types/staking';

interface NativeStakeMessageItemProps {
  props: NativeStakingResult;
}

export const NativeStakeMessageItem: FC<NativeStakeMessageItemProps> = ({
  props,
}) => {
  console.log(props);
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

  // Error state
  if (!props.success) {
    return (
      <BaseBorderedMessageItem
        title="Staking Failed"
        icon={
          <div className="bg-red-500/10 p-1 rounded-lg">
            <AiOutlineCloseCircle className="text-red-500" size={28} />
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-500 text-sm font-medium">Error</p>
            <p className="text-textColor text-sm mt-1">{props.error}</p>
          </div>

          {props.data.details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-surface/30 rounded-lg p-3">
                <p className="text-secText text-sm">Amount</p>
                <p className="text-textColor text-lg font-bold">
                  {props.data.details.amount} SOL
                </p>
              </div>

              <div className="bg-surface/30 rounded-lg p-3">
                <p className="text-secText text-sm">Validator</p>
                <p className="text-textColor text-sm font-mono">
                  {getAbbreviatedAddress(props.data.details.validator)}
                </p>
              </div>
            </div>
          )}
        </div>
      </BaseBorderedMessageItem>
    );
  }

  // Compact content for dashboard view
  const compactContent = (
    <div className="flex items-center gap-2">
      <AiOutlineCheckCircle className="text-green-500" size={16} />
      <span className="text-textColor text-sm font-medium">
        Staked {props.data.details.amount} SOL
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
            copyToClipboard(props.data.stakeAccount, 'Stake account');
          }}
          className="p-1 rounded-full hover:bg-surface/50 transition-colors"
          title="Copy stake account"
        >
          <FiCopy className="text-secText" size={12} />
        </button>
        <a
          href={`https://solscan.io/account/${props.data.stakeAccount}`}
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
        <span className="text-xs text-secText">
          Validator: {getAbbreviatedAddress(props.data.details.validator)}
        </span>
      </div>
    </div>
  );

  // If dashboard is open, show compact view
  if (dashboardOpen) {
    return (
      <BaseExpandableMessageItem
        title="SOL Staking"
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
            `https://solscan.io/account/${props.data.stakeAccount}`,
            '_blank'
          );
        }}
      />
    </div>
  );

  const icon = (
    <div className="bg-primary/10 p-1 rounded-lg">
      <LuCoins className="text-primary" size={28} />
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title="SOL Staking Successful"
      icon={icon}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {/* Success indicator */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AiOutlineCheckCircle className="text-green-500" size={20} />
            <p className="text-green-500 text-sm font-medium">
              Staking transaction created successfully
            </p>
          </div>
          {props.signAndSend && (
            <p className="text-secText text-xs mt-1">
              Transaction ready for signing and sending
            </p>
          )}
        </div>

        {/* Staking details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Amount Staked</p>
            <p className="text-textColor text-xl font-bold">
              {props.data.details.amount} SOL
            </p>
          </div>

          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-textColor text-sm">Pending Activation</p>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="flex flex-col gap-2">
          <div className="bg-surface/30 p-3 rounded-lg">
            <span className="text-xs text-secText">Stake Account:</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-mono text-textColor break-all pr-2">
                {props.data.stakeAccount}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(props.data.stakeAccount, 'Stake account');
                }}
                className="p-1 rounded-full hover:bg-surface/50 flex-shrink-0"
              >
                <FiCopy size={14} className="text-secText" />
              </button>
            </div>
          </div>

          <div className="bg-surface/30 p-3 rounded-lg">
            <span className="text-xs text-secText">Validator:</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-mono text-textColor break-all pr-2">
                {props.data.details.validator}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(
                    props.data.details.validator,
                    'Validator address'
                  );
                }}
                className="p-1 rounded-full hover:bg-surface/50 flex-shrink-0"
              >
                <FiCopy size={14} className="text-secText" />
              </button>
            </div>
          </div>

          <div className="bg-surface/30 p-3 rounded-lg">
            <span className="text-xs text-secText">Owner:</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-mono text-textColor break-all pr-2">
                {props.data.details.owner}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(props.data.details.owner, 'Owner address');
                }}
                className="p-1 rounded-full hover:bg-surface/50 flex-shrink-0"
              >
                <FiCopy size={14} className="text-secText" />
              </button>
            </div>
          </div>
        </div>

        {/* Information note */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-500 text-sm font-medium">Note</p>
          <p className="text-textColor text-xs mt-1">
            Your stake will become active in the next epoch (approximately 2-3
            days). You can check the status using the stake status tool.
          </p>
        </div>
      </div>
    </BaseBorderedMessageItem>
  );
};
