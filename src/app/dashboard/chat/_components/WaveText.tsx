'use client';

import React, { useMemo } from 'react';

interface WaveTextProps {
  /**
   * The text message to display with the wave animation
   */
  message: string;

  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Base opacity for the dim state (0-1)
   * @default 0.5
   */
  baseOpacity?: number;

  /**
   * Highlight opacity for the bright state (0-1)
   * @default 1
   */
  highlightOpacity?: number;

  /**
   * Animation duration in seconds
   * @default 2
   */
  animationDuration?: number;

  /**
   * Delay between characters in seconds
   * @default 0.08
   */
  characterDelay?: number;

  /**
   * Use primary or primaryDark color for the text
   * @default false (primary is used)
   */
  useDarkVariant?: boolean;
}

/**
 * WaveText component displays text with a wave animation that moves through the characters.
 * Each character transitions from a dim to bright state in sequence.
 */
const WaveText: React.FC<WaveTextProps> = ({
  message,
  className = '',
  baseOpacity = 0.5,
  highlightOpacity = 1,
  animationDuration = 2.5,
  characterDelay = 0.08,
  useDarkVariant = false,
}) => {
  // Split message into array of characters only once when props change
  const characters = useMemo(() => message.split(''), [message]);

  const colorVar = useDarkVariant ? '--color-primaryDark' : '--color-primary';

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {characters.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="inline-block"
          style={{
            color: `rgb(var(${colorVar}) / ${baseOpacity})`,
            animation: `waveTextPulse ${animationDuration}s infinite ease-in-out`,
            animationDelay: `${index * characterDelay}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}

      <style jsx>{`
        @keyframes waveTextPulse {
          0%,
          100% {
            color: rgb(var(${colorVar}) / ${baseOpacity});
          }
          50% {
            color: rgb(var(${colorVar}) / ${highlightOpacity});
          }
        }
      `}</style>
    </div>
  );
};

export default WaveText;
