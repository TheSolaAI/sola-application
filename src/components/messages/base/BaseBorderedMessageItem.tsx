'use client';

import { FC, ReactNode } from 'react';

interface BaseBorderedMessageItemProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
}

export const BaseBorderedMessageItem: FC<BaseBorderedMessageItemProps> = ({
  title,
  subtitle,
  icon,
  children,
  footer,
  onClick,
}) => {
  return (
    <div
      className="flex my-1 justify-start w-full transition-opacity duration-500"
      onClick={onClick}
    >
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full cursor-pointer hover:border-primary/30 transition-all">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-primary/10">
          <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
            {icon && icon}
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-secText bg-surface/50 px-2 py-1 rounded">
              {subtitle}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-3 bg-surface/20 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
