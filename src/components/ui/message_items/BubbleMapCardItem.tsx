import { FC } from 'react';
import { BubbleMapChatContent } from '../../../types/chatItem.ts';
import BaseGridChatItem from './general/BaseGridChatItem.tsx';

interface BubbleMapChatItemProps {
  props: BubbleMapChatContent;
}

export const BubbleMapChatItem: FC<BubbleMapChatItemProps> = ({ props }) => {
  return (
    <BaseGridChatItem col={1}>
      <iframe
        src={`https://app.bubblemaps.io/sol/token/${props.data.token}`}
        className="w-full h-64 md:h-94 rounded-lg"
      />
    </BaseGridChatItem>
  );
};
