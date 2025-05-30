'use client';

import { FC } from 'react';
import { LuCoins, LuExternalLink, LuDownload } from 'react-icons/lu';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { useLayoutContext } from '@/providers/LayoutProvider';
import type { WithdrawalResult } from '@/types/staking';

interface NativeWithdrawMessageItemProps {
  props: WithdrawalResult['data'];
}

export const NativeWithdrawMessageItem: FC<NativeWithdrawMessageItemProps> = ({
  props,
}) => {
  const { theme } = useThemeManager();
  const { dashboardOpen } = useLayoutContext();
  console.log('native withdraw props', props);
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
  if (!props || !props.stakeAccount) {
    return (
      <BaseBorderedMessageItem
        title="Withdrawal Failed"
        icon={
          <div className="bg-red-500/10 p-1 rounded-lg">
            <AiOutlineCloseCircle className="text-red-500" size={28} />
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-500 text-sm font-medium">Error</p>
            <p className="text-textColor text-sm mt-1">
              Invalid withdrawal data
            </p>
          </div>

          {props?.stakeAccount && (
            <div className="bg-surface/30 rounded-lg p-3">
              <p className="text-secText text-sm">Stake Account</p>
              <p className="text-textColor text-sm font-mono">
                {getAbbreviatedAddress(props.stakeAccount)}
              </p>
            </div>
          )}
        </div>
      </BaseBorderedMessageItem>
    );
  }

  const data = props;

  // Compact content for dashboard view
  const compactContent = (
    <div className="flex items-center gap-2">
      <AiOutlineCheckCircle className="text-green-500" size={16} />
      <span className="text-textColor text-sm font-medium">
        Withdrew {(data.withdrawnAmount ?? 0).toFixed(2)} SOL
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
        <span className="text-xs text-secText">
          From: {getAbbreviatedAddress(data.stakeAccount)}
        </span>
      </div>
    </div>
  );

  // If dashboard is open, show compact view
  if (dashboardOpen) {
    return (
      <BaseExpandableMessageItem
        title="SOL Withdrawal"
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
    <div className="bg-green-500/10 p-1 rounded-lg">
      <LuDownload className="text-green-500" size={28} />
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title="SOL Withdrawal Successful"
      icon={icon}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {/* Success indicator */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AiOutlineCheckCircle className="text-green-500" size={20} />
            <p className="text-green-500 text-sm font-medium">
              Withdrawal transaction created successfully
            </p>
          </div>
          {data.transaction && (
            <p className="text-secText text-xs mt-1">
              Transaction ready for signing and sending
            </p>
          )}
        </div>

        {/* Withdrawal details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Amount Withdrawn</p>
            <p className="text-textColor text-xl font-bold">
              {(data.withdrawnAmount ?? 0).toFixed(2)} SOL
            </p>
          </div>

          <div className="bg-background rounded-lg p-3">
            <p className="text-secText text-sm">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-textColor text-sm">Ready to Withdraw</p>
            </div>
          </div>
        </div>

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

        {/* Information note */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-500 text-sm font-medium">Note</p>
          <p className="text-textColor text-xs mt-1">
            Your SOL has been withdrawn from the stake account and will be
            available in your wallet once the transaction is confirmed. The
            stake account will be closed after withdrawal.
          </p>
        </div>
      </div>
    </BaseBorderedMessageItem>
  );
};
