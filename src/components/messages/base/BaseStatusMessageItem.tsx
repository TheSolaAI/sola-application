'use client';

import { FC, ReactNode } from 'react';

type StatusType = 'success' | 'error' | 'pending' | 'default';

interface BaseStatusMessageItemProps {
  title: string;
  status: StatusType;
  statusText?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
}

export const BaseStatusMessageItem: FC<BaseStatusMessageItemProps> = ({
  title,
  status,
  statusText,
  icon,
  children,
  footer,
  onClick,
}) => {
  // Define color schemes based on status
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          bgColor: 'bg-green-500/10',
          iconBg: 'bg-green-500/20',
          textColor: 'text-green-500',
        };
      case 'error':
        return {
          bgColor: 'bg-red-500/10',
          iconBg: 'bg-red-500/20',
          textColor: 'text-red-500',
        };
      case 'pending':
        return {
          bgColor: 'bg-yellow-500/10',
          iconBg: 'bg-yellow-500/20',
          textColor: 'text-yellow-500',
        };
      default:
        return {
          bgColor: 'bg-primary/10',
          iconBg: 'bg-primary/20',
          textColor: 'text-primary',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <div
      className="flex my-1 justify-start w-full transition-opacity duration-500"
      onClick={onClick}
    >
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full relative">
        {/* Decorative background element */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute -right-16 -top-16 w-32 h-32 ${colors.iconBg} rounded-full blur-xl animate-pulse`}
          ></div>
          <div
            className={`absolute -left-16 -bottom-16 w-32 h-32 ${colors.iconBg} rounded-full blur-xl animate-pulse`}
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        {/* Header */}
        <div
          className={`px-4 py-3 border-b border-border flex justify-between items-center ${colors.bgColor} relative`}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className={`w-10 h-10 rounded-lg shadow-md flex items-center justify-center ${colors.iconBg}`}
              >
                {icon}
              </div>
            )}
            <h2 className="text-lg font-semibold text-textColor">{title}</h2>
          </div>
          {statusText && (
            <span
              className={`text-xs ${colors.textColor} bg-surface/50 px-2 py-1 rounded flex items-center`}
            >
              {statusText}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 relative z-10">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-3 bg-surface/20 border-t border-border relative z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
