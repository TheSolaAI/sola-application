'use client';

import { useState, useEffect } from 'react';

interface PWAStatus {
  isPwa: boolean;
  isInstallPromptAvailable: boolean;
  promptInstall: () => Promise<string | null>;
  installationState: 'idle' | 'pending' | 'installed' | 'error';
  userAgent: {
    isIOS: boolean;
    isAndroid: boolean;
    isSafari: boolean;
    isChrome: boolean;
  };
}

export function usePwaStatus(): PWAStatus {
  const [isPwa, setIsPwa] = useState(false);
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] =
    useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installationState, setInstallationState] = useState<
    'idle' | 'pending' | 'installed' | 'error'
  >('idle');
  const [userAgent, setUserAgent] = useState({
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detect device and browser
      const ua = window.navigator.userAgent.toLowerCase();
      setUserAgent({
        isIOS: /iphone|ipad|ipod/.test(ua),
        isAndroid: /android/.test(ua),
        isSafari: /safari/.test(ua) && !/chrome/.test(ua),
        isChrome: /chrome/.test(ua) && !/edge|edg/.test(ua),
      });

      // Check if app is running in standalone mode (PWA)
      const isPwaMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        Boolean((window.navigator as any).standalone);

      setIsPwa(isPwaMode);

      // Listen for standalone mode changes
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const handleMediaChange = (e: MediaQueryListEvent) => {
        setIsPwa(e.matches);
        if (e.matches) {
          setInstallationState('installed');
        }
      };

      try {
        // Modern browsers
        mediaQuery.addEventListener('change', handleMediaChange);
      } catch (e) {
        // Safari and older browsers
        mediaQuery.addListener(handleMediaChange as any);
      }

      // Listen for install prompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 76+ from automatically showing the prompt
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallPromptAvailable(true);
      });

      // Listen for app installed event
      window.addEventListener('appinstalled', () => {
        setInstallationState('installed');
        setIsInstallPromptAvailable(false);
        setDeferredPrompt(null);
        console.log('PWA was installed');
      });

      return () => {
        try {
          mediaQuery.removeEventListener('change', handleMediaChange);
        } catch (e) {
          mediaQuery.removeListener(handleMediaChange as any);
        }
      };
    }
  }, []);

  // Function to prompt user to install the PWA
  const promptInstall = async (): Promise<string | null> => {
    if (deferredPrompt) {
      try {
        setInstallationState('pending');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsInstallPromptAvailable(false);

        if (outcome === 'accepted') {
          setInstallationState('installed');
        } else {
          setInstallationState('idle');
        }

        return outcome;
      } catch (error) {
        console.error('Error during installation prompt:', error);
        setInstallationState('error');
        return 'error';
      }
    }
    return null;
  };

  return {
    isPwa,
    isInstallPromptAvailable,
    promptInstall,
    installationState,
    userAgent,
  };
}
