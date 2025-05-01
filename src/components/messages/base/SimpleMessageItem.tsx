'use client';
import { FC } from 'react';
import MarkdownRenderer from '@/components/messages/general/MarkDownRenderer';

interface SimpleMessageItemProps {
  text: string;
}

export const SimpleMessageItem: FC<SimpleMessageItemProps> = ({ text }) => {
  return (
    <div className="my-5 max-w-[100%] md:max-w-[80%]">
      <div className="text-textColor p-3 rounded-r-xl rounded-tl-2xl font-normal text-md text-wrap">
        <MarkdownRenderer content={text} />
      </div>
    </div>
  );
};
