'use client';

import { FC } from 'react';

export const Pill: FC<{
  text?: string;
  color: string;
  textColor: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ text, color, textColor, icon, onClick, hoverable = false }) => {
  return (
    <div
      className={`rounded-full px-3 py-2 text-sm flex items-center gap-x-1 transition-all duration-200 ${
        hoverable && onClick
          ? 'hover:shadow-[0px_0px_15px_1px] hover:shadow-primaryDark cursor-pointer'
          : ''
      }`}
      style={{ backgroundColor: color, color: textColor }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {icon && icon}
      <p className="text-base">{text}</p>
    </div>
  );
};
