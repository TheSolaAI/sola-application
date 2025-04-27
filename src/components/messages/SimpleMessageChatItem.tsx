'use client';
import { FC } from 'react';
import BaseChatItem from '@/components/messages/general/BaseChatItem';
import MarkDownRenderer from '@/components/messages/general/MarkDownRenderer';

interface SimpleMessageChatItemProps {
  text: string;
}

export const SimpleMessageChatItem: FC<SimpleMessageChatItemProps> = ({
  text,
}) => {
  return (
    <BaseChatItem>
      <div className="text-textColor bg-sec_background px-4 py-3 rounded-r-xl rounded-tl-xl">
        <MarkDownRenderer content={text} />
      </div>
    </BaseChatItem>
  );
};
