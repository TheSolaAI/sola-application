'use client';

import { FC } from 'react';
import { AgentTokenDetail } from '@/types/goatIndex';
import useThemeManager from '@/store/ThemeManager';
import { FcGlobe } from 'react-icons/fc';
import { FaXTwitter } from 'react-icons/fa6';
import { RiTelegramFill } from 'react-icons/ri';
import { FiCopy } from 'react-icons/fi';
import { Pill } from '@/components/common/Pill';
import { toast } from 'sonner';

interface ProjectSummaryCardProps {
  tokenDetail?: AgentTokenDetail;
}

export const ProjectSummaryCard: FC<ProjectSummaryCardProps> = ({
  tokenDetail,
}) => {
  const { theme } = useThemeManager();

  return (
    <div className="bg-baseBackground rounded-xl w-full flex flex-col p-4 overflow-x-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <img
          src={tokenDetail?.image}
          alt="token"
          className="w-20 h-20 rounded-xl"
        />
        <div className="flex flex-col w-full">
          <div className="flex flex-row gap-x-2 items-center justify-between">
            <div className="flex flex-row gap-x-2 items-center">
              <h1 className="text-2xl sm:text-3xl font-semibold text-textColor">
                {tokenDetail?.name}
              </h1>
              {tokenDetail?.category && (
                <Pill
                  text={tokenDetail?.category}
                  color={theme.sec_background}
                  textColor={theme.secText}
                />
              )}
            </div>
            <div className="hidden sm:block">
              <Pill
                text={tokenDetail?.contractAddress}
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FiCopy size={18} />}
                hoverable={true}
                onClick={() => {
                  navigator.clipboard.writeText(tokenDetail?.contractAddress!);
                  toast.success('Address copied to clipboard');
                }}
              />
            </div>
            <div className="sm:hidden">
              <Pill
                icon={<FiCopy size={18} />}
                color={theme.sec_background}
                textColor={theme.secText}
                hoverable={true}
                onClick={() => {
                  navigator.clipboard.writeText(tokenDetail?.contractAddress!);
                  toast.success('Address copied to clipboard');
                }}
              />
            </div>
          </div>

          {/* Labels as hashtags */}
          <div className="flex flex-row flex-wrap gap-x-2 text-secText mt-1">
            {tokenDetail?.labels &&
              tokenDetail.labels.map((label, index) => (
                <span key={index} className="text-sm font-medium">
                  #{String(label)}
                </span>
              ))}
          </div>

          <p className="text-secText mt-1">{tokenDetail?.description}</p>

          <div className="flex flex-row gap-2 flex-wrap mt-5">
            {/* Social Links */}
            {tokenDetail?.website && (
              <Pill
                text="Website"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FcGlobe size={22} />}
                onClick={() => window.open(tokenDetail.website, '_blank')}
                hoverable={true}
              />
            )}
            {tokenDetail?.twitter && (
              <Pill
                text="Twitter"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<FaXTwitter size={22} />}
                onClick={() => window.open(tokenDetail.twitter, '_blank')}
                hoverable={true}
              />
            )}
            {tokenDetail?.telegram && (
              <Pill
                text="Telegram"
                color={theme.sec_background}
                textColor={theme.secText}
                icon={<RiTelegramFill size={22} />}
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
                icon={<FaXTwitter size={22} />}
                onClick={() => window.open(tokenDetail.devTwitter, '_blank')}
                hoverable={true}
              />
            )}
            {tokenDetail?.devDoxxed && (
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
