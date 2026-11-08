'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSessionHandler } from '@/store/SessionHandler';
import {
  closeDocumentPiP,
  isDocumentPiPSupported,
  requestDocumentPiP,
  shouldTriggerAutoPiP,
  DocumentPiPOptions,
} from '@/utils/pictureInPicture';
import useIsMobile from '@/utils/isMobile';

export interface UsePictureInPictureOptions {
  autoPiPOnHidden?: boolean;
  dimensions?: DocumentPiPOptions;
}

export function usePictureInPicture(options?: UsePictureInPictureOptions) {
  const { autoPiPOnHidden = true, dimensions } = options ?? {};
  const [isPipOpen, setIsPipOpen] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const isSupported = isDocumentPiPSupported();
  const isMobileViewport = useIsMobile();
  const sessionState = useSessionHandler((s) => s.state);

  const pipWindowRef = useRef<Window | null>(null);
  pipWindowRef.current = pipWindow;

  const closePiP = useCallback(() => {
    if (pipWindowRef.current) {
      closeDocumentPiP(pipWindowRef.current);
      pipWindowRef.current = null;
      setPipWindow(null);
      setIsPipOpen(false);
    }
  }, []);

  const openPiP = useCallback(async (): Promise<Window | null> => {
    if (!isSupported) {
      return null;
    }
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      return pipWindowRef.current;
    }

    try {
      const win = await requestDocumentPiP(dimensions);
      if (!win) {
        return null;
      }

      win.addEventListener('pagehide', () => {
        setPipWindow(null);
        setIsPipOpen(false);
        pipWindowRef.current = null;
      });

      pipWindowRef.current = win;
      setPipWindow(win);
      setIsPipOpen(true);
      return win;
    } catch (error) {
      console.warn('[usePictureInPicture] Could not launch PiP window:', error);
      return null;
    }
  }, [isSupported, dimensions]);

  const togglePiP = useCallback(async () => {
    if (isPipOpen) {
      closePiP();
    } else {
      await openPiP();
    }
  }, [isPipOpen, openPiP, closePiP]);

  // Close PiP if session terminates or errors
  useEffect(() => {
    if (sessionState !== 'open' && isPipOpen) {
      closePiP();
    }
  }, [sessionState, isPipOpen, closePiP]);

  // Handle automatic PiP on document visibility change and MediaSession enterpictureinpicture (Google Meet behavior)
  useEffect(() => {
    if (!autoPiPOnHidden || !isSupported || typeof document === 'undefined') {
      return;
    }

    const checkMobile = () =>
      isMobileViewport || (typeof window !== 'undefined' && window.innerWidth < 640);

    const handleAutoPiP = async (visibilityOverride?: DocumentVisibilityState | string) => {
      const shouldTrigger = shouldTriggerAutoPiP({
        visibilityState: visibilityOverride ?? document.visibilityState,
        sessionState: useSessionHandler.getState().state,
        isMobile: checkMobile(),
        isPipOpen: !!pipWindowRef.current && !pipWindowRef.current.closed,
        autoPipEnabled: autoPiPOnHidden,
      });

      if (shouldTrigger) {
        await openPiP();
      }
    };

    const handleVisibilityChange = () => {
      void handleAutoPiP(document.visibilityState);
    };

    const mediaSession =
      typeof navigator !== 'undefined' && 'mediaSession' in navigator
        ? navigator.mediaSession
        : null;

    if (mediaSession && typeof mediaSession.setActionHandler === 'function') {
      try {
        mediaSession.setActionHandler('enterpictureinpicture' as MediaSessionAction, () => {
          void handleAutoPiP('hidden');
        });
      } catch {
        // Ignore if browser does not support enterpictureinpicture action
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mediaSession && typeof mediaSession.setActionHandler === 'function') {
        try {
          mediaSession.setActionHandler('enterpictureinpicture' as MediaSessionAction, null);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [autoPiPOnHidden, isSupported, isMobileViewport, openPiP]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closePiP();
    };
  }, [closePiP]);

  return {
    isSupported,
    isPipOpen,
    pipWindow,
    portalContainer: pipWindow?.document?.body ?? null,
    openPiP,
    closePiP,
    togglePiP,
  };
}
