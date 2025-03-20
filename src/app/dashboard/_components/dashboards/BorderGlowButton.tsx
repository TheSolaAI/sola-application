'use client';

import { IconType } from 'react-icons';

interface BorderGlowButtonProps {
  text: string;
  icon?: IconType;
}

export const BorderGlowButton = ({
  text,
  icon: Icon,
}: BorderGlowButtonProps) => {
  return (
    <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-backgroundContrast px-3 py-1 text-sm font-medium text-textColorContrast backdrop-blur-3xl">
        {Icon && <Icon className="mr-2 h-4 w-4" />} {text}
      </span>
    </button>
  );
};
