'use client';
import React, { FC } from 'react';
import { createPortal } from 'react-dom';
import { usePictureInPicture } from '@/hooks/usePictureInPicture';
import { PipSessionControls } from './PipSessionControls';
import { useSessionHandler } from '@/store/SessionHandler';

export const PictureInPictureManager: FC = () => {
  const { isSupported, isPipOpen, portalContainer, closePiP, togglePiP } =
    usePictureInPicture({ autoPiPOnHidden: true });
  const sessionState = useSessionHandler((s) => s.state);

  // If PiP window is open and portal container exists, render controls in PiP window
  const pipPortal =
    isPipOpen && portalContainer
      ? createPortal(<PipSessionControls onClosePip={closePiP} />, portalContainer)
      : null;

  // Manual PiP button displayed when session is active
  const isSessionActive = sessionState === 'open';

  return (
    <>
      {pipPortal}
      {isSupported && isSessionActive && (
        <button
          onClick={togglePiP}
          title={isPipOpen ? 'Close Picture-in-Picture' : 'Open Picture-in-Picture'}
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-[#181820]/90 hover:bg-[#252532] border border-[#2b2b3a] rounded-full shadow-2xl backdrop-blur-md transition-all duration-200"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <rect x="11" y="9" width="9" height="6" rx="1" ry="1" fill="#3b82f6" />
          </svg>
          <span>{isPipOpen ? 'Exit PiP' : 'Mini Player'}</span>
        </button>
      )}
    </>
  );
};
