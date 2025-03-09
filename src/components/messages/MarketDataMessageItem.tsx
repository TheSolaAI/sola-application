import { FC } from 'react';
import { MarketDataChatContent } from '../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';

interface MarketDataChatItemProps {
  props: MarketDataChatContent;
}

export const MarketDataChatItem: FC<MarketDataChatItemProps> = ({ props }) => {
  return (
    <BaseGridChatItem col={1}>
      <h3 className="text-lg font-semibold mb-2">Market Analysis</h3>
      <div className="flex flex-wrap gap-2">
        {props.data.marketAnalysis.map((analysis, idx) => (
          <a
            key={idx}
            className="bg-surface p-2 rounded-md text-sm font-medium"
            href={analysis.link}
            target="_blank"
            rel="noreferrer"
          >
            {analysis.text}
          </a>
        ))}
      </div>
    </BaseGridChatItem>
  );
};
