import { useCallback } from 'react';
import { usePipStore } from '../../store/zustand/PipState';
import PiPWindow from './PipWindow';
import { Minimize, Maximize } from 'react-feather';
import { toast } from 'sonner';

export default function PipLayout() {
  const { isSupported, requestPipWindow, pipWindow, closePipWindow } =
    usePipStore();

  const startPiP = useCallback(() => {
    requestPipWindow(500, 500);
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
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                <h3>Sola PIP</h3>
                <button>Clicks</button>
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
