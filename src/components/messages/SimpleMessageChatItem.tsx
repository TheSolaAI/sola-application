'use client';
import { FC } from 'react';
import { SimpleMessageChatContent } from '@/types/chatItem';
import BaseChatItem from '@/components/messages/general/BaseChatItem';
import MarkDownRenderer from '@/components/messages/general/MarkDownRenderer';

interface SimpleMessageChatItemProps {
  props: SimpleMessageChatContent;
}

export const SimpleMessageChatItem: FC<SimpleMessageChatItemProps> = ({
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
