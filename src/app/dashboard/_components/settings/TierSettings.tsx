'use client';
import { forwardRef, useImperativeHandle } from 'react';
import { LuBadgeDollarSign, LuInfo } from 'react-icons/lu';
import { useAppSelector } from '@/redux/hook';
import { formatNumber } from '@/utils/formatNumber';

export interface TierSettingsRef {
  onSubmit: () => void;
}

export const TierSettings = forwardRef<TierSettingsRef>((_, ref) => {
  // Redux state for tier information
  const tierData = useAppSelector((state) => state.tier);
  const { userTier, currentUsage, percentageUsed } = tierData;

  // Calculate tier information
  const tierLevel = userTier?.tier || 0;

  // Determine color based on percentage used
  const getProgressColor = () => {
    if (percentageUsed >= 90) return 'bg-red-500';
    if (percentageUsed >= 70) return 'bg-orange-400';
    return 'bg-green-500';
  };

  // Expose submit method for the settings modal
  useImperativeHandle(ref, () => ({
    onSubmit: () => {
      // No action needed for tier settings on submit
    },
  }));

  // If no tier data is available yet, show loading state
  if (!userTier) {
    return <div className="animate-pulse p-4">Loading tier information...</div>;
  }

  return (
    <div className="flex flex-col w-full items-start justify-center gap-y-8">
      {/* Tier Overview Section */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor">Tier Status</h1>
        <p className="font-regular text-secText mb-4">
          Your current tier level and usage information
        </p>

        <div className="space-y-4">
          {/* Tier Level Card */}
          <div className="border border-border rounded-md p-4 bg-sec_background/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <LuBadgeDollarSign size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-secText text-sm">Current Tier</p>
              <p className="text-textColor text-2xl font-bold">{tierLevel}</p>
            </div>
          </div>

          {/* SOLA Balance */}
          <div className="border border-border rounded-md p-4 bg-sec_background/50">
            <p className="text-secText text-sm mb-1">SOLA Balance</p>
            <p className="text-textColor text-xl font-bold">
              {formatNumber(userTier.totalSolaBalance || 0)} SOLA
            </p>
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor">Usage Details</h1>
        <p className="font-regular text-secText mb-4">
          Your current consumption of available resources
        </p>

        {/* Usage Progress Bar */}
        <div className="border border-border rounded-md p-4 bg-sec_background/50">
          <div className="flex justify-between items-center mb-2">
            <p className="text-textColor">Usage</p>
            <p className="text-textColor font-medium">
              {Math.round(percentageUsed)}% used
            </p>
          </div>
          <div className="w-full bg-background rounded-full h-3 mb-4">
            <div
              className={`${getProgressColor()} h-3 rounded-full`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-secText">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="w-full">
        <div className="border border-border rounded-md p-4 bg-sec_background/10 flex gap-3">
          <div className="flex-shrink-0 pt-1">
            <LuInfo size={18} className="text-secText" />
          </div>
          <div>
            <h2 className="text-textColor font-medium mb-1">
              Important Information
            </h2>
            <p className="text-secText text-sm">
              All usage amounts shown are estimates and may differ from your
              true usage which is calculate server side. Tier levels and usage
              limits are subject to change based on network-wide usage patterns
              and may be adjusted to ensure fair resource allocation and
              continued service availability.
            </p>
          </div>
        </div>
      </div>

      {/* Tier Explanation */}
      <div className="w-full">
        <h1 className="font-semibold text-textColor">About Tiers</h1>
        <div className="border border-border rounded-md p-4 bg-sec_background/50 mt-2">
          <p className="text-secText">
            Your tier level is determined by your SOLA token balance. Higher
            tier levels give you access to more AI requests and features. Your
            tier automatically adjusts as your token balance changes.
          </p>
        </div>
      </div>
    </div>
  );
});

TierSettings.displayName = 'TierSettings';
