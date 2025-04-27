'use client';
import React from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-24 right-4 z-10">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Message bubble with glow effect */}
        <defs>
          <filter id="pulse-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx="60" cy="60" r="40" fill="#2a3142" />

        {/* Sound icon */}
        <path
          d="M55 60 a8 8 0 0 1 16 0 a8 8 0 0 1 -16 0 M71 54 a15 15 0 0 1 0 12 M76 50 a23 23 0 0 1 0 20"
          stroke="#7289fd"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Inner glow pulse */}
        <circle
          cx="60"
          cy="60"
          r="42"
          stroke="#7289fd"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          className="animate-pulse-opacity animate-pulse-radius"
        />

        {/* Outer glow pulse */}
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke="#7289fd"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          filter="url(#pulse-glow)"
          className="animate-pulse-opacity-slow animate-pulse-radius-slow"
        />

        {/* Extreme outer pulse (subtle) */}
        <circle
          cx="60"
          cy="60"
          r="56"
          stroke="#7289fd"
          strokeWidth="1"
          fill="none"
          opacity="0.2"
          filter="url(#pulse-glow)"
          className="animate-pulse-opacity-slower animate-pulse-radius-slower"
        />
      </svg>
    </div>
  );
};

export default AudioVisualizer;
