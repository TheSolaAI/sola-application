'use client';

import { FC } from 'react';
import { AgentTokenDetail } from '@/types/goatIndex';
import useThemeManager from '@/store/ThemeManager';
import { FcGlobe } from 'react-icons/fc';
import { FaXTwitter } from 'react-icons/fa6';
import { RiTelegramFill } from 'react-icons/ri';
import { FiCopy } from 'react-icons/fi';
import { LuExternalLink } from 'react-icons/lu';
import { Pill } from '@/components/common/Pill';
import { toast } from 'sonner';

interface ProjectSummaryCardProps {
  tokenDetail?: AgentTokenDetail;
}

export const ProjectSummaryCard: FC<ProjectSummaryCardProps> = ({
  tokenDetail,
}) => {
  const { theme } = useThemeManager();

  const copyToClipboard = () => {
    if (tokenDetail?.contractAddress) {
      navigator.clipboard.writeText(tokenDetail.contractAddress);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <div className="flex my-1 justify-start w-full transition-opacity duration-500">
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
        {/* Header with address */}
        <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row justify-between gap-2">
          <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
            {tokenDetail?.name}
            {tokenDetail?.category && (
              <Pill
                text={tokenDetail?.category}
                color={theme.sec_background}
                textColor={theme.secText}
              />
            )}
          </h2>

          {tokenDetail?.contractAddress && (
            <div className="flex items-center">
              <div className="bg-surface/30 px-3 py-1 rounded-lg text-sm font-mono text-textColor overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[240px]">
                {tokenDetail.contractAddress}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-1 ml-1 rounded-full hover:bg-surface/50 transition-colors"
                title="Copy to clipboard"
              >
                <FiCopy className="text-secText" size={14} />
              </button>
              <a
                href={`https://solscan.io/token/${tokenDetail.contractAddress}`}
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
              {tokenDetail?.image && (
                <img
                  src={tokenDetail.image}
                  alt="token"
                  className="rounded-xl w-16 h-16"
                />
              )}

              <div className="flex-1">
                {/* Labels as hashtags */}
                <div className="mb-2">
                  <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                    Labels
                  </label>
                  <div className="flex flex-row flex-wrap gap-x-2 text-secText">
                    {tokenDetail?.labels &&
                      tokenDetail.labels.map((label, index) => (
                        <span key={index} className="text-sm font-medium">
                          #{String(label.name)}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section - Side by side on larger screens */}
            {tokenDetail?.description && (
              <div className="md:w-1/2">
                <label className="text-xs uppercase tracking-wider text-secText mb-1 block">
                  Description
                </label>
                <div className="text-secText text-sm bg-surface/30 p-3 rounded-lg h-full">
                  {tokenDetail.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Links Footer */}
        <div className="px-4 py-3 bg-surface/20 border-t border-border">
          <div className="flex flex-row gap-x-2 flex-wrap">
            {/* Social Links */}
            {tokenDetail?.website && (
              <Pill
                text="Website"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FcGlobe size={20} />}
                onClick={() => window.open(tokenDetail.website, '_blank')}
                hoverable={true}
              />
            )}
            {tokenDetail?.twitter && (
              <Pill
                text="Twitter"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaXTwitter size={20} />}
                onClick={() => window.open(tokenDetail.twitter, '_blank')}
                hoverable={true}
              />
            )}
            {tokenDetail?.telegram && (
              <Pill
                text="Telegram"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<RiTelegramFill size={20} />}
                onClick={() => window.open(tokenDetail.telegram, '_blank')}
                hoverable={true}
              />
            )}
            {/* Dev Details start */}
            <div className="w-[3px] my-[2px] bg-sec_background" />
            {tokenDetail?.devTwitter && (
              <Pill
                text="Dev Twitter"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaXTwitter size={20} />}
                onClick={() => window.open(tokenDetail.devTwitter, '_blank')}
                hoverable={true}
              />
            )}
            {tokenDetail?.devDoxxed !== undefined && (
              <Pill
                text={tokenDetail.devDoxxed ? 'Dev Doxxed' : 'Dev Not Doxxed'}
                color={theme.sec_background}
                textColor={tokenDetail.devDoxxed ? theme.secText : 'orange'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
