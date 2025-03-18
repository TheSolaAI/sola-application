'use client';

import { FC } from 'react';
import { TokenExtensions } from '@/types/response';
import { Pill } from '@/components/common/Pill';
import useThemeManager from '@/store/ThemeManager';
import { toast } from 'sonner';
import { FiCopy } from 'react-icons/fi';
import { LuTrendingUp, LuTrendingDown } from 'react-icons/lu';
import { FcGlobe } from 'react-icons/fc';
import { FaCoins, FaDiscord, FaXTwitter } from 'react-icons/fa6';

interface TokenSummaryCardProps {
  name: string;
  address: string;
  logoURI: string;
  price: number;
  symbol: string;
  priceChange24hPercent: number;
  extensions: TokenExtensions;
}

export const TokenSummaryCard: FC<TokenSummaryCardProps> = ({
  name,
  address,
  logoURI,
  price,
  symbol,
  priceChange24hPercent,
  extensions,
}) => {
  // Global State
  const { theme } = useThemeManager();

  return (
    <div className="bg-baseBackground rounded-xl w-full flex flex-col p-4">
      <div className="flex flex-row gap-x-4 items-start overflow-x-auto">
        <img src={logoURI} alt="token" className="w-20 h-20 rounded-xl" />
        <div className="flex flex-col w-full">
          <div className="flex flex-row w-full justify-between">
            <h1 className="text-3xl font-semibold text-textColor">
              {name} ({symbol})
            </h1>
            <Pill
              text={address}
              color={theme.sec_background}
              textColor={theme.secText}
              icon={<FiCopy size={18} />}
              hoverable={true}
              onClick={() => {
                navigator.clipboard.writeText(address);
                toast.success('Address copied to clipboard');
              }}
            />
          </div>
          {/* Price Section */}
          <div className="flex flex-row items-center">
            <h1
              className="text-2xl font-semibold text-textColor mr-2"
              style={{ color: priceChange24hPercent > 0 ? 'green' : 'red' }}
            >
              ${price}
            </h1>
            {priceChange24hPercent !== 0 && (
              <div
                className="flex items-center"
                style={{ color: priceChange24hPercent > 0 ? 'green' : 'red' }}
              >
                {priceChange24hPercent > 0 ? (
                  <LuTrendingUp size={18} />
                ) : (
                  <LuTrendingDown size={18} />
                )}
                <span className="ml-1">
                  {priceChange24hPercent > 0 ? '+' : ''}
                  {priceChange24hPercent.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          {/* Description if exists */}
          {extensions.description && (
            <p className="text-secText mt-1">{extensions.description}</p>
          )}
          {/* Social Section */}
          <div className="flex flex-row gap-x-2 mt-2">
            {extensions.website && (
              <Pill
                text="Website"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FcGlobe size={22} />}
                hoverable={true}
                onClick={() => window.open(extensions.website, '_blank')}
              />
            )}
            {extensions.coingeckoId && (
              <Pill
                text="Coingecko"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaCoins size={22} />}
                hoverable={true}
                onClick={() =>
                  window.open(
                    `https://www.coingecko.com/en/coins/${extensions.coingeckoId}`,
                    '_blank'
                  )
                }
              />
            )}
            {extensions.telegram && (
              <Pill
                text="Telegram"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FcGlobe size={22} />}
                hoverable={true}
                onClick={() => window.open(extensions.telegram!, '_blank')}
              />
            )}
            {extensions.twitter && (
              <Pill
                text="Twitter"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaXTwitter size={22} />}
                hoverable={true}
                onClick={() => window.open(extensions.twitter, '_blank')}
              />
            )}
            {extensions.discord && (
              <Pill
                text="Discord"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaDiscord size={22} />}
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
