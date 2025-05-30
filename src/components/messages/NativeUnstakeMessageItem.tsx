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
import type { NativeUnstakeResult } from '@/types/staking';

interface NativeUnstakeMessageItemProps {
  props: NativeUnstakeResult;
}

export const NativeUnstakeMessageItem: FC<NativeUnstakeMessageItemProps> = ({
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

  // Error state
  if (!props.success) {
    return (
      <BaseBorderedMessageItem
        title="Unstaking Failed"
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

          {props.data.stakeAccount && (
            <div className="bg-surface/30 rounded-lg p-3">
              <p className="text-secText text-sm">Stake Account</p>
              <p className="text-textColor text-sm font-mono">
                {getAbbreviatedAddress(props.data.stakeAccount)}
              </p>
            </div>
          )}
        </div>
      </BaseBorderedMessageItem>
    );
  }

  // Compact content for dashboard view
  const compactContent = (
    <div className="flex items-center gap-2">
      <AiOutlineCheckCircle className="text-orange-500" size={16} />
      <span className="text-textColor text-sm font-medium">
        Unstaked from {getAbbreviatedAddress(props.data.stakeAccount)}
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
        <span className="text-xs text-secText">Deactivating...</span>
      </div>
    </div>
  );

  // If dashboard is open, show compact view
  if (dashboardOpen) {
    return (
      <BaseExpandableMessageItem
        title="SOL Unstaking"
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
    <div className="bg-orange-500/10 p-1 rounded-lg">
      <LuCoins className="text-orange-500" size={28} />
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title="SOL Unstaking Initiated"
      icon={icon}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {/* Success indicator */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AiOutlineCheckCircle className="text-orange-500" size={20} />
            <p className="text-orange-500 text-sm font-medium">
              Unstaking transaction created successfully
            </p>
          </div>
          {props.signAndSend && (
            <p className="text-secText text-xs mt-1">
              Transaction ready for signing and sending
            </p>
          )}
        </div>

        {/* Status */}
        <div className="bg-background rounded-lg p-3">
          <p className="text-secText text-sm">Status</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <p className="text-textColor text-sm">Deactivating</p>
          </div>
        </div>

        {/* Account details */}
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

        {/* Information note */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-500 text-sm font-medium">Note</p>
          <p className="text-textColor text-xs mt-1">
            Your stake is now deactivating and will be available for withdrawal
            in the next epoch (approximately 2-3 days). You can check the status
            and withdraw when ready using the stake status and withdraw tools.
          </p>
        </div>
      </div>
    </BaseBorderedMessageItem>
  );
};
