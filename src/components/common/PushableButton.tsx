// PushableButton.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PushableButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  darkColor?: string;
  darkerColor?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const PushableButton: React.FC<PushableButtonProps> = ({
  children,
  onClick,
  color = 'hsl(345deg 100% 47%)', // Default red color
  darkColor, // Will be calculated if not provided
  darkerColor, // Will be calculated if not provided
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}) => {
  // Calculate darker colors if not provided
  const calculatedDarkColor = darkColor || `hsl(${getHue(color)}deg 100% 32%)`;
  const calculatedDarkerColor =
    darkerColor || `hsl(${getHue(color)}deg 100% 16%)`;

  // Convert any color format to HSL to extract hue
  function getHue(colorStr: string): number {
    // For HSL format, extract hue directly
    const hslMatch = colorStr.match(/hsl\((\d+)deg/);
    if (hslMatch && hslMatch[1]) {
      return parseInt(hslMatch[1], 10);
    }

    // Default to original hue if conversion fails
    return 345;
  }

  return (
    <motion.button
      type={type}
      className={`
        pushable
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}
        relative
        border-none
        bg-transparent
        p-0
        cursor-pointer
        outline-offset-4
        transition-[filter]
        duration-250
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={{ filter: 'brightness(110%)' }}
      style={
        {
          // CSS variables for color customization
          '--button-color': color,
          '--button-dark-color': calculatedDarkColor,
          '--button-darker-color': calculatedDarkerColor,
        } as React.CSSProperties
      }
    >
      <motion.span
        className="shadow absolute top-0 left-0 w-full h-full rounded-xl will-change-transform"
        style={{
          background: 'hsl(0deg 0% 0% / 0.25)',
          transform: 'translateY(2px)',
        }}
        transition={{
          duration: 0.6,
          ease: [0.3, 0.7, 0.4, 1],
          fast: { duration: 0.25, ease: [0.3, 0.7, 0.4, 1.5] },
          revert: { duration: 0.034 },
        }}
        variants={{
          hover: {
            transform: 'translateY(4px)',
            transition: { duration: 0.25, ease: [0.3, 0.7, 0.4, 1.5] },
          },
          tap: {
            transform: 'translateY(1px)',
            transition: { duration: 0.034 },
          },
        }}
      />

      <motion.span
        className="edge absolute top-0 left-0 w-full h-full rounded-xl"
        style={{
          background: `linear-gradient(
            to left,
            var(--button-darker-color) 0%,
            var(--button-dark-color) 8%,
            var(--button-dark-color) 92%,
            var(--button-darker-color) 100%
          )`,
        }}
      />

      <motion.span
        className="front relative block px-4 py-2 rounded-xl text-xl text-white will-change-transform"
        style={{
          background: 'var(--button-color)',
          transform: 'translateY(-4px)',
        }}
        transition={{
          duration: 0.6,
          ease: [0.3, 0.7, 0.4, 1],
          fast: { duration: 0.25, ease: [0.3, 0.7, 0.4, 1.5] },
          revert: { duration: 0.034 },
        }}
        variants={{
          hover: {
            transform: 'translateY(-6px)',
            transition: { duration: 0.25, ease: [0.3, 0.7, 0.4, 1.5] },
          },
          tap: {
            transform: 'translateY(-2px)',
            transition: { duration: 0.034 },
          },
        }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

export default PushableButton;
