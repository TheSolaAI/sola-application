'use client';

import { FC } from 'react';
import { TokenExtensions } from '@/types/token';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { toast } from 'sonner';
import { FiCopy } from 'react-icons/fi';
import { LuTrendingUp, LuTrendingDown, LuExternalLink } from 'react-icons/lu';
import { FcGlobe } from 'react-icons/fc';
import { FaCoins, FaDiscord, FaXTwitter } from 'react-icons/fa6';
import Image from 'next/image';

interface TokenSummaryCardProps {
  name?: string;
  address?: string;
  logoURI?: string;
  price?: number;
  symbol?: string;
  priceChange24hPercent?: number;
  extensions?: TokenExtensions | null;
}

export const TokenSummaryCard: FC<TokenSummaryCardProps> = ({
  name = 'Unknown Token',
  address = '',
  logoURI = '',
  price = 0,
  symbol = '',
  priceChange24hPercent = 0,
  extensions = null,
}) => {
  // Global State
  const { theme } = useThemeManager();

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const isPricePositive = (priceChange24hPercent || 0) > 0;
  const priceChangeColor = isPricePositive ? 'green' : 'red';

  return (
    <div className="flex my-1 justify-start w-full transition-opacity duration-500">
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
        {/* Header with address */}
        <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row justify-between gap-2">
          <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
            {name} {symbol && `(${symbol})`}
          </h2>

          {address && (
            <div className="flex items-center">
              <div className="bg-surface/30 px-3 py-1 rounded-lg text-sm font-mono text-textColor overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[240px]">
                {address}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1 ml-1 rounded-full hover:bg-surface/50 transition-colors"
                title="Copy to clipboard"
              >
                <FiCopy className="text-secText" size={14} />
              </button>
              <a
                href={`https://solscan.io/token/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 ml-1 rounded-full hover:bg-surface/50 transition-colors"
                title="View on Solscan"
              >
                <LuExternalLink className="text-secText" size={14} />
              </a>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-start gap-4 md:w-1/2">
              {logoURI && (
                <Image
                  src={logoURI}
                  alt="token"
                  className="rounded-xl"
                  width={60}
                  height={60}
                />
              )}

              <div className="flex-1">
                {/* Price Section */}
                <div className="mb-4">
                  <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                    Current Price
                  </label>
                  <div className="text-textColor font-medium text-2xl">
                    ${price}
                  </div>
                </div>

                {/* Price Change - Prominent Display */}
                <div className="mb-4">
                  <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                    24h Change
                  </label>
                  <div
                    className={`flex items-center text-lg font-medium`}
                    style={{ color: priceChangeColor }}
                  >
                    {isPricePositive ? (
                      <LuTrendingUp size={24} className="mr-2" />
                    ) : (
                      <LuTrendingDown size={24} className="mr-2" />
                    )}
                    <span>
                      {isPricePositive ? '+' : ''}
                      {priceChange24hPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section - Side by side on larger screens */}
            {extensions?.description && (
              <div className="md:w-1/2">
                <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                  Description
                </label>
                <div className="text-secText text-sm bg-surface/30 p-3 rounded-lg h-full">
                  {extensions.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Links Footer */}
        <div className="px-4 py-3 bg-surface/20 border-t border-border">
          <div className="flex flex-row gap-x-2 flex-wrap">
            {extensions?.website && (
              <Pill
                text="Website"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FcGlobe size={20} />}
                hoverable={true}
                onClick={() => window.open(extensions.website, '_blank')}
              />
            )}
            {extensions?.coingeckoId && (
              <Pill
                text="Coingecko"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaCoins size={20} />}
                hoverable={true}
                onClick={() =>
                  window.open(
                    `https://www.coingecko.com/en/coins/${extensions.coingeckoId}`,
                    '_blank'
                  )
                }
              />
            )}
            {extensions?.telegram && (
              <Pill
                text="Telegram"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FcGlobe size={20} />}
                hoverable={true}
                onClick={() => window.open(extensions.telegram || '', '_blank')}
              />
            )}
            {extensions?.twitter && (
              <Pill
                text="Twitter"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaXTwitter size={20} />}
                hoverable={true}
                onClick={() => window.open(extensions.twitter, '_blank')}
              />
            )}
            {extensions?.discord && (
              <Pill
                text="Discord"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaDiscord size={20} />}
                hoverable={true}
                onClick={() => window.open(extensions.discord, '_blank')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
