// AnimatedButton.tsx
'use client'; // Add this if using Next.js App Router

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}) => {
  // Button styles to match the image (dark gradient with 3D effect)
  const buttonStyles = `
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
    relative
    rounded-md
    overflow-hidden
    flex
    items-center
    justify-center
    px-4
    py-2
    font-medium
    text-white
    shadow-md
    border
    border-gray-700
  `;

  return (
    <motion.button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Background with gradient overlay to create 3D effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900"></div>

      {/* Subtle highlight at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gray-500 opacity-30"></div>

      {/* Bottom shadow */}
      <div className="absolute inset-x-0 bottom-0 h-2 bg-black opacity-20"></div>

      {/* Content container */}
      <div className="relative flex items-center justify-center gap-2">
        {children}
      </div>
    </motion.button>
  );
};

export default AnimatedButton;
