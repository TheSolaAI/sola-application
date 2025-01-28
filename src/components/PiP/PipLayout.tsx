import { useCallback } from 'react';
import { usePipStore } from '../../store/zustand/PipState';
import PiPWindow from './PipWindow';
import { Minimize, Maximize } from 'react-feather';
import { toast } from 'sonner';
import { SessionActive, SessionStopped } from '../SessionControls';

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

  const startPiP = useCallback(() => {
    requestPipWindow(100, 100);
  }, [requestPipWindow]);

  return (
    <div>
      {isSupported ? (
        <>
          <button onClick={pipWindow ? closePipWindow : startPiP}>
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
                    height:'100%'
                  }}
              >
                {isSessionActive ? (
                  <SessionActive stopSession={stopSession} />
                ) : (
                  <SessionStopped startSession={startSession} />
                )}
              </div>
            </PiPWindow>
          )}
        </>
      ) : (
        toast.error("Your browser doesn't support Picture-in-Picture")
      )}
    </div>
  );
}
