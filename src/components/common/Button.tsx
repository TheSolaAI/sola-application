import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'default', size = 'md', children, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',

          // Variants using theme variables
          variant === 'default' &&
            'bg-background text-textColor hover:bg-sec_background',
          variant === 'primary' &&
            'bg-primary text-textColorContrast hover:bg-primaryDark',
          variant === 'outline' &&
            'border border-border bg-transparent hover:bg-sec_background/30',
          variant === 'ghost' && 'bg-transparent hover:bg-sec_background/30',

          // Sizes
          size === 'sm' && 'text-xs px-3 py-1.5',
          size === 'md' && 'text-sm px-4 py-2',
          size === 'lg' && 'text-base px-5 py-2.5',

          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
