import { useCallback, useState } from 'react';
import { usePipStore } from '../../models/PipState.ts';
import PiPWindow from './PipWindow.tsx';
import { Maximize, Minimize } from 'lucide-react';
import { toast } from 'sonner';
import { SessionControls, SessionStopped } from '../SessionControls.tsx';

interface PipLayoutProps {
  startSession: () => void;
  stopSession: () => void;
  isSessionActive: boolean;
}

export default function PipLayout({
  startSession,
  stopSession,
  isSessionActive,
}: PipLayoutProps) {
  const { isSupported, requestPipWindow, pipWindow, closePipWindow } =
    usePipStore();

  const [hasShownToast, setHasShownToast] = useState(false);

  const startPiP = useCallback(() => {
    requestPipWindow(100, 100);
  }, [requestPipWindow]);

  if (!isSupported && !hasShownToast) {
    toast.error("Your browser doesn't support Picture-in-Picture");
    setHasShownToast(true);
  }

  return (
    <div>
      {isSupported ? (
        <>
          <button
            onClick={pipWindow ? closePipWindow : startPiP}
            className="hidden md:block"
          >
            {pipWindow ? <Maximize /> : <Minimize />}
          </button>
          {pipWindow && (
            <PiPWindow pipWindow={pipWindow}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                }}
              >
                {isSessionActive ? (
                  <SessionControls stopSession={stopSession} />
                ) : (
                  <SessionStopped startSession={startSession} />
                )}
              </div>
            </PiPWindow>
          )}
        </>
      ) : null}
    </div>
  );
}
