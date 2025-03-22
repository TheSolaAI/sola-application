'use client';

import BaseGridChatItem from '@/components/messages/general/BaseGridChatItem';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { GoatIndexDashboard } from '@/app/dashboard/_components/dashboards/goatIndexDashboard/GoatIndexDashboard';
import Image from 'next/image';
import { GoatIndexTokenData } from '@/types/goatIndex';

interface AiProjectsChatItemProps {
  props: { data: GoatIndexTokenData[] };
}

export const AiProjects = ({ props }: AiProjectsChatItemProps) => {
  /**
   * Global State
   */
  const { handleDashboardOpen, dashboardOpen, setDashboardLayoutContent } =
    useLayoutContext();

  return (
    <>
      <BaseGridChatItem col={2}>
        {props.data?.slice(0, 6).map((token, index) => (
          <div
            key={index}
            className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background p-3 shadow-sm w-full transition-all duration-300 ease-in-out hover:bg-surface cursor-pointer hover:shadow-lg"
            onClick={() => {
              setDashboardLayoutContent(
                <GoatIndexDashboard contract_address={token.contractAddress} />
              );
              if (!dashboardOpen) handleDashboardOpen(true);
            }}
          >
            <div className="flex items-center gap-4">
              <Image
                src={token.image}
                alt="sanctumimage"
                className="rounded-lg"
                height={64}
                width={64}
              />
              <div>
                <p className="text-base font-semibold">{token.name}</p>
                <p className="text-sm font-medium">${token.symbol}</p>
                <p className="text-base font-normal">
                  Mindshare: {Number(token.mindShare).toFixed(3)}
                </p>
              </div>
            </div>
            <p className="text-sm flex items-center gap-2 font-normal">
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
      </BaseGridChatItem>
    </>
  );
};
