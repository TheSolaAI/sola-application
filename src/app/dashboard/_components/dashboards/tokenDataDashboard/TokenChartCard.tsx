'use client';

import { FC, useEffect, useState } from 'react';
import useThemeManager from '@/store/ThemeManager';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';
// import { LuLineChart } from 'react-icons/lu';

interface TokenChartCardProps {
  address: string;
}

export const TokenChartCard: FC<TokenChartCardProps> = ({ address }) => {
  /**
   * Global State
   */
  const { theme } = useThemeManager();

  /**
   * Local State
   */
  const [timezone, setTimezone] = useState<string>('UTC');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get the current timezone in format like "America/New_York"
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Encode for URL (replacing slashes with %2F)
    const encodedTimezone = encodeURIComponent(currentTimezone);
    setTimezone(encodedTimezone);
  }, []);

  return (
    <div className="flex my-1 justify-start w-full transition-opacity duration-500">
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-primary/10">
          <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
            {/* <LuLineChart size={18} /> */}
            Price Chart
          </h2>
          <span className="text-xs text-secText bg-surface/50 px-2 py-1 rounded">
            {decodeURIComponent(timezone)}
          </span>
        </div>

        {/* Chart Content */}
        <div className="p-0">
          {' '}
          {/* No padding for the chart to maximize space */}
          <MaskedRevealLoader isLoading={loading}>
            <iframe
              width="100%"
              height="500"
              style={{ borderRadius: '0' }} // Remove border radius for the iframe to prevent double rounding
              src={`https://birdeye.so/tv-widget/${address}?chain=solana&viewMode=pair&chartInterval=15&chartType=Candle&chartTimezone=${timezone}&chartLeftToolbar=hide&theme=${theme.baseTheme}&cssCustomProperties=--tv-color-platform-background%3A${encodeURIComponent(theme.background)}&cssCustomProperties=--tv-color-pane-background%3A${encodeURIComponent(theme.sec_background)}&chartOverrides=paneProperties.backgroundType%3Asolid&chartOverrides=paneProperties.background%3A${encodeURIComponent(`rgba(${hexToRgb(theme.background)}, 1)`)}`}
              onLoad={() => setLoading(false)}
            />
          </MaskedRevealLoader>
        </div>

        {/* Footer with instructions */}
        <div className="px-4 py-3 bg-surface/20 border-t border-border">
          <div className="text-xs text-secText">
            <p>
              Chart provided by Birdeye. Double-click to zoom in, drag to move,
              use toolbar for additional options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert hex colors to RGB format
function hexToRgb(hex: string): string {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
