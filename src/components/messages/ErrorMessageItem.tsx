'use client';

import { FC } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';

interface ErrorMessageItemProps {
  message: string;
}

export const ErrorMessageItem: FC<ErrorMessageItemProps> = ({ message }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
      <LuTriangleAlert className="text-red-500 shrink-0" size={16} />
      <span className="text-sm text-red-500 font-medium">{message}</span>
    </div>
  );
};
