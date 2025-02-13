import { FC } from 'react';
import { BubbleMapChatContent } from '../../../types/chatItem.ts';
import BaseMonoGridChatItem from './general/BaseMonoGridChatItem.tsx';

interface BubbleMapChatItemProps {
  props: BubbleMapChatContent;
}

export const BubbleMapChatItem: FC<BubbleMapChatItemProps> = ({ props }) => {
  return (
    <BaseMonoGridChatItem>
      <iframe
        src={`https://app.bubblemaps.io/sol/token/${props.data.token}`}
        className="w-full h-64 md:h-94 rounded-lg"
      />
    </BaseMonoGridChatItem>
  );
};
