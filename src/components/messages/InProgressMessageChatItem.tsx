'use client';

import { FC } from 'react';
import BaseChatItem from './general/BaseChatItem';
import MarkDownRenderer from './general/MarkDownRenderer';
import { InProgressChatContent } from '@/types/chatItem';

interface InProgressMessageChatItemProps {
  props: InProgressChatContent;
}

export const InProgressMessageChatItem: FC<InProgressMessageChatItemProps> = ({
  props,
}) => {
  return (
    <BaseChatItem>
      <div className="text-textColor">
        <MarkDownRenderer content={props.text} />
      </div>
    </BaseChatItem>
  );
};
