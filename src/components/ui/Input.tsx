import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          className={cn(
            'flex h-10 w-full rounded-md border bg-transparent px-3 py-2',
            'text-sm placeholder:text-secText',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'transition-colors',
            'border-border focus:ring-offset-background',
            error && 'border-red-500 focus:ring-red-500',
            rightIcon && 'pr-10',
            'text-textColor',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
        {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
