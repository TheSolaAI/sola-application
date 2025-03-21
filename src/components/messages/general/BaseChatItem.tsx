'use client';
import { ReactNode } from 'react';

interface BaseChatItemProps {
  children: ReactNode;
}

export default function BaseChatItem({ children }: BaseChatItemProps) {
  return (
    <div className="flex my-1 justify-start max-w-[100%] md:max-w-[80%] transition-opacity duration-500">
      <div className="p-2 w-full break-words whitespace-normal">{children}</div>
    </div>
  );
}
