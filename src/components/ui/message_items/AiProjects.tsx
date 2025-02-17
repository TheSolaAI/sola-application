import { AiProjectsChatContent } from '../../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { useDashboardHandler } from '../../../models/DashboardHandler.ts';

interface AiProjectsChatItemProps {
  props: AiProjectsChatContent;
}

export const AiProjects = ({ props }: AiProjectsChatItemProps) => {
  const { openDashboard } = useDashboardHandler();

  return (
    <BaseGridChatItem col={2}>
      {props.category === 'tokensByMindShare' &&
        props.tokensByMindShare?.slice(0, 6).map((token, index) => (
          <div
            key={index}
            className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background p-3 w-full transition-all duration-300 ease-in-out hover:bg-surface cursor-pointer hover:shadow-lg"
            onClick={() => {
              openDashboard('goatIndex', token.contractAddress);
            }}
          >
            <div className="flex items-center gap-4">
              <img
                src={token.image}
                alt="sanctumimage"
                className="h-16 rounded-lg"
              />
              <div>
                <p className="text-base font-semibold">{token.name}</p>
                <p className="text-sm font-thin">${token.symbol}</p>
                <p className="text-base font-thin">
                  Mindshare: {Number(token.mindShare).toFixed(3)}
                </p>
              </div>
            </div>
            <p className="text-sm flex items-center gap-2 font-thin">
              Follow:{' '}
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
  );
};
