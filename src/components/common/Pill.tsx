'use client';

import { FC } from 'react';

interface PillProps {
  text?: string;
  color: string;
  textColor: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  important?: boolean;
}

export const Pill: FC<PillProps> = ({
  text,
  color,
  textColor,
  icon,
  onClick,
  hoverable = false,
  important = false,
}) => {
  // Determine hover and important classes
  const hoverClass = hoverable
    ? important
      ? 'hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer'
      : 'hover:opacity-90 hover:shadow-md transition-all duration-200 cursor-pointer'
    : '';

  const importantClass = important
    ? 'border-[1px] font-semibold shadow-md'
    : '';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${importantClass} ${hoverClass} `}
      style={{
        backgroundColor: color,
        color: textColor,
        borderColor: important ? textColor : 'transparent',
      }}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {text && <span>{text}</span>}
    </button>
  );
};
