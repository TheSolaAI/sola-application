import { FC } from 'react';
import { TopHoldersChatContent } from '../../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';
import { ExternalLink } from 'lucide-react';
import { formatNumber } from '../../../utils/formatNumber.ts';

interface TopHoldersChatItemProps {
  props: TopHoldersChatContent;
}

export const TopHoldersMessageItem: FC<TopHoldersChatItemProps> = ({
  props,
}) => {
  return (
    <BaseGridChatItem col={1}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Top Holders Information</h2>
        <div>
          <div className="grid grid-cols-2 gap-x-6 py-2 font-medium text-left uppercase tracking-wider border-b border-gray-700">
            <span>Owner</span>
            <span className="text-right">Balance</span>
          </div>

          <div>
            {props.data.map((value, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-x-6 py-2 items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">
                    {value.owner.slice(0, 5)}...
                    {value.owner.slice(-5)}
                  </span>
                  <button
                    onClick={() =>
                      window.open(
                        `https://solscan.io/account/${value.owner}`,
                        '_blank',
                      )
                    }
                    className="text-xs font-medium rounded-lg hover:scale-105 hover:shadow-lg transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right">{formatNumber(value.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseGridChatItem>
  );
};
