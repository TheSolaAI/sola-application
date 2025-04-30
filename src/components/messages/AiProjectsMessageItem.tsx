'use client';

import { FC, useState, useEffect } from 'react';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { GoatIndexDashboard } from '@/app/dashboard/_components/dashboards/goatIndexDashboard/GoatIndexDashboard';
import Image from 'next/image';
import { GoatIndexTokenData } from '@/types/goatIndex';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { BaseGridMessageItem } from './base/BaseGridMessageItem';

interface AiProjectsMessageItemProps {
  props: {
    category: string;
    projects: GoatIndexTokenData[];
  };
}

export const AiProjectsMessageItem: FC<AiProjectsMessageItemProps> = ({
  props,
}) => {
  /**
   * Global State
   */
  const { handleDashboardOpen, dashboardOpen, setDashboardLayoutContent } =
    useLayoutContext();

  /**
   * Local State
   */
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (props.projects && props.projects.length > 0) {
      setLoading(false);
    }
  }, [props.projects]);

  const footer = (
    <div className="text-xs text-secText">
      <p>
        Click on any project to view detailed analytics. Projects are ranked by
        mindshare in the AI ecosystem.
      </p>
    </div>
  );

  return (
    <BaseBorderedMessageItem
      title="AI Projects"
      subtitle={props.category}
      footer={footer}
    >
      <MaskedRevealLoader isLoading={loading}>
        <BaseGridMessageItem col={2}>
          {props.projects.slice(0, 6).map((token, index) => (
            <div
              key={index}
              className="group relative overflow-hidden block rounded-xl text-secText bg-background p-3 shadow-sm w-full transition-all duration-300 ease-in-out hover:bg-surface cursor-pointer hover:shadow-lg"
              onClick={() => {
                setDashboardLayoutContent(
                  <GoatIndexDashboard
                    contract_address={token.contractAddress}
                  />
                );
                if (!dashboardOpen) handleDashboardOpen(true);
              }}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={token.image}
                  alt="project image"
                  className="rounded-lg"
                  height={64}
                  width={64}
                />
                <div>
                  <p className="text-base font-semibold text-textColor">
                    {token.name}
                  </p>
                  <p className="text-sm font-medium">${token.symbol}</p>
                  <p className="text-base font-normal">
                    Mindshare: {Number(token.mindShare).toFixed(3)}
                  </p>
                </div>
              </div>
              <p className="text-sm flex items-center gap-2 font-normal mt-2">
                Follow:
                <FaSquareXTwitter
                  className="h-4 w-4 hover:opacity-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`${token.twitter}`, '_blank');
                  }}
                />
              </p>
            </div>
          ))}
        </BaseGridMessageItem>
      </MaskedRevealLoader>
    </BaseBorderedMessageItem>
  );
};
