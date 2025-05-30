'use client';

import { FC } from 'react';
import { LuServer, LuExternalLink } from 'react-icons/lu';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'sonner';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { stakingResultSchemas } from '@sola-labs/ai-kit';
import type { GetValidatorsResult } from '@/types/staking';

// Helper function for validation since validateToolResult is not exported
function validateToolResult<T>(
  data: unknown,
  schemaKey: keyof typeof stakingResultSchemas
): { success: true; data: T } | { success: false; error: string } {
  try {
    const schema = stakingResultSchemas[schemaKey];
    const validatedData = schema.parse(data) as T;
    return { success: true, data: validatedData };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

interface ValidatorsMessageItemProps {
  props: unknown; // Accept unknown to enforce validation
}

export const ValidatorsMessageItem: FC<ValidatorsMessageItemProps> = ({
  props: rawProps,
}) => {
  const { theme } = useThemeManager();
  const { dashboardOpen } = useLayoutContext();

  // Validate props at runtime
  const validation = validateToolResult<GetValidatorsResult>(
    rawProps,
    'getValidators'
  );

  // If validation fails, show error state
  if (!validation.success) {
    return (
      <BaseBorderedMessageItem
        title="Failed to Load Validators"
        icon={
          <div className="bg-red-500/10 p-1 rounded-lg">
            <LuServer className="text-red-500" size={28} />
          </div>
        }
      >
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-500 text-sm font-medium">Validation Error</p>
          <p className="text-textColor text-sm mt-1">{validation.error}</p>
        </div>
      </BaseBorderedMessageItem>
    );
  }

  // Props are now validated and typed
  const props = validation.data;

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
        title="Failed to Load Validators"
        icon={
          <div className="bg-red-500/10 p-1 rounded-lg">
            <LuServer className="text-red-500" size={28} />
          </div>
        }
      >
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-500 text-sm font-medium">Error</p>
          <p className="text-textColor text-sm mt-1">{props.error}</p>
        </div>
      </BaseBorderedMessageItem>
    );
  }

  // Compact content for dashboard view
  const compactContent = (
    <div className="flex items-center gap-2">
      <LuServer className="text-primary" size={16} />
      <span className="text-textColor text-sm font-medium">
        {props.data.validators.length} Validators Available
      </span>
    </div>
  );

  // Compact footer
  const compactFooter = (
    <div className="flex justify-between items-center">
      <div>
        <span className="text-xs text-secText">Native SOL Validators</span>
      </div>
    </div>
  );

  // If dashboard is open, show compact view
  if (dashboardOpen) {
    return (
      <BaseExpandableMessageItem
        title="Validators"
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
        text={`${props.data.validators.length} Validators`}
        color={theme.sec_background}
        textColor={theme.secText}
        icon={<LuServer size={20} />}
        hoverable={false}
      />
    </div>
  );

  const icon = (
    <div className="bg-primary/10 p-1 rounded-lg">
      <LuServer className="text-primary" size={28} />
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title="Available Validators"
      subtitle={`${props.data.validators.length} validators`}
      icon={icon}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-500 text-sm font-medium">
            Native SOL Staking
          </p>
          <p className="text-textColor text-xs mt-1">
            These are verified validators for native SOL staking. Choose one to
            delegate your stake.
          </p>
        </div>

        {/* Validators list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {props.data.validators.map(
            (validator: { name: string; address: string }, index: number) => (
              <div
                key={index}
                className="bg-surface/30 p-3 rounded-lg hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-textColor text-sm font-medium truncate">
                      {validator.name}
                    </p>
                    <p className="text-secText text-xs font-mono mt-1">
                      {getAbbreviatedAddress(validator.address)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(validator.address, 'Validator address');
                      }}
                      className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                      title="Copy validator address"
                    >
                      <FiCopy className="text-secText" size={14} />
                    </button>

                    <a
                      href={`https://solscan.io/account/${validator.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                      title="View on Solscan"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LuExternalLink className="text-secText" size={14} />
                    </a>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Usage note */}
        <div className="bg-surface/20 border border-border rounded-lg p-3">
          <p className="text-secText text-sm font-medium">How to use</p>
          <p className="text-textColor text-xs mt-1">
            Copy a validator address and use it with the native staking tool to
            delegate your SOL.
          </p>
        </div>
      </div>
    </BaseBorderedMessageItem>
  );
};
