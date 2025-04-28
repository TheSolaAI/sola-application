'use client';
import { FC } from 'react';
import MarkDownRenderer from '@/components/messages/general/MarkDownRenderer';

interface SimpleMessageChatItemProps {
  text: string;
}

export const SimpleMessageChatItem: FC<SimpleMessageChatItemProps> = ({
  text,
}) => {
  return (
    <div className="my-5 max-w-[100%] md:max-w-[80%]">
      <div className="text-textColor p-3 rounded-r-xl rounded-tl-2xl font-normal text-md">
        <MarkDownRenderer content={text} />
      </div>
    </div>
  );
};
