'use client';

import { FC, useEffect, useState } from 'react';
import useThemeManager from '@/store/ThemeManager';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';

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
    <MaskedRevealLoader isLoading={loading}>
      <iframe
        width="100%"
        height="600"
        style={{ borderRadius: '0.75rem' }} // 0.75rem equals rounded-xl
        src={`https://birdeye.so/tv-widget/${address}?chain=solana&viewMode=pair&chartInterval=15&chartType=Candle&chartTimezone=${timezone}&chartLeftToolbar=hide&theme=${theme.baseTheme}&cssCustomProperties=--tv-color-platform-background%3A${encodeURIComponent(theme.background)}&cssCustomProperties=--tv-color-pane-background%3A${encodeURIComponent(theme.sec_background)}&chartOverrides=paneProperties.backgroundType%3Asolid&chartOverrides=paneProperties.background%3A${encodeURIComponent(`rgba(${hexToRgb(theme.background)}, 1)`)}`}
        onLoad={() => setLoading(false)}
      />
    </MaskedRevealLoader>
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
