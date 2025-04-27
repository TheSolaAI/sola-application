import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-sec_background shadow-sm',
        'overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';
