'use client';

import React from 'react';

interface SkeletonWaveProps {
  /**
   * Number of lines to show in the skeleton message
   * @default 3
   */
  lines?: number;

  /**
   * Width percentages for each line
   * Default varies by line position
   */
  lineWidths?: string[];

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Use primary or primaryDark color
   * @default false (uses primary)
   */
  useDarkVariant?: boolean;
}

/**
 * SkeletonWave - A skeleton message component with wave animation effect
 * using custom primary color variables.
 */
const SkeletonWave: React.FC<SkeletonWaveProps> = ({
  lines = 3,
  lineWidths,
  className = '',
  useDarkVariant = false,
}) => {
  // Default line widths if not provided
  const defaultLineWidths = ['85%', '100%', '75%'];

  // Determine which color variable to use
  const colorVar = useDarkVariant ? '--color-primaryDark' : '--color-primary';

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        const width =
          lineWidths?.[index] ||
          defaultLineWidths[index % defaultLineWidths.length];

        return (
          <div
            key={index}
            className="relative overflow-hidden rounded"
            style={{
              width,
              height: '0.75rem',
              backgroundColor: `rgb(var(${colorVar}) / 0.3)`,
            }}
          >
            <div
              className="absolute inset-0 wave-animation"
              style={{
                background: `linear-gradient(90deg, transparent, rgb(var(${colorVar}) / 0.15), transparent)`,
              }}
            />
          </div>
        );
      })}

      {/* Wave animation styling */}
      <style jsx>{`
        .wave-animation {
          animation: waveEffect 1.5s ease-in-out infinite;
        }

        @keyframes waveEffect {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonWave;
