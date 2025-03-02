import { AiProjectsChatContent } from '../../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { useDashboardHandler } from '../../../models/DashboardHandler.ts';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import BaseChatItem from './general/BaseChatItem.tsx';
import useThemeManager from '../../../models/ThemeManager.ts';

interface AiProjectsChatItemProps {
  props: AiProjectsChatContent;
}

export const AiProjects = ({ props }: AiProjectsChatItemProps) => {
  const { openDashboard } = useDashboardHandler();
  const { theme } = useThemeManager();
  return (
    <>
      <BaseGridChatItem col={2}>
        {props.category === 'tokensByMindShare' &&
          props.tokensByMindShare?.slice(0, 6).map((token, index) => (
            <div
              key={index}
              className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background p-3 shadow-sm w-full transition-all duration-300 ease-in-out hover:bg-surface cursor-pointer hover:shadow-lg"
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

        {props.category === 'tokenByRanking' &&
          props.projectsByRanking?.slice(0, 6).map((token, index) => (
            <div
              key={index}
              className="group relative overflow-hidden block rounded-xl text-secText bg-sec_background shadow-sm p-3 w-full transition-all duration-300 ease-in-out hover:bg-surface cursor-pointer hover:shadow-lg"
              onClick={() => {
                openDashboard('goatIndex', token.tokenDetail.contractAddress);
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={token.tokenDetail.image}
                  alt="sanctumimage"
                  className="h-16 rounded-lg"
                />
                <div>
                  <p className="text-base font-semibold">
                    {token.tokenDetail.name}
                  </p>
                  <p className="text-sm font-thin">
                    ${token.tokenDetail.symbol}
                  </p>
                  <p className="text-base font-thin">
                    Mindshare: {Number(token.metrics.mindShare).toFixed(3)}
                  </p>
                </div>
              </div>
              <p className="text-sm flex items-center gap-2 font-thin">
                Follow:{' '}
                <FaSquareXTwitter
                  className="h-4 w-4 hover:opacity-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`${token.tokenDetail.twitter}`, '_blank');
                  }}
                />
              </p>
            </div>
          ))}
      </BaseGridChatItem>{' '}
      <BaseChatItem>
        {props.category === 'mindshare' &&
          props.tokensByMindShare &&
          (() => {
            const treemapData = props.tokensByMindShare.map((token) => ({
              name: token.name,
              tokenCa: token.contractAddress,
              size: token.mindShare * 100,
            }));

            return (
              <div className="w-full h-full bg-sec_background p-4 rounded-lg">
                <h2 className="text-textColor text-lg mb-2">
                  Mindshare by Projects
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    stroke={theme.textColor}
                    fill={theme.primaryDark}
                    animationEasing={'ease-in-out'}
                    animationDuration={1000}
                    isAnimationActive={true}
                  >
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const { name, size } = payload[0].payload;
                        return (
                          <div className="bg-white text-black p-2 rounded shadow">
                            <strong className="truncate">{name}</strong>
                            <br />
                            Mind Share: {size}%
                          </div>
                        );
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            );
          })()}
      </BaseChatItem>
    </>
  );
};
