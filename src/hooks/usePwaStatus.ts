'use client';

import { useState, useEffect } from 'react';

export function usePwaStatus() {
  const [isPwa, setIsPwa] = useState(false);
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] =
    useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if app is running in standalone mode (PWA)
      const isPwaMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        Boolean((window.navigator as any).standalone);

      setIsPwa(isPwaMode);

      // Listen for install prompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallPromptAvailable(true);
      });
    }
  }, []);

  // Function to prompt user to install the PWA
  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsInstallPromptAvailable(false);
      return outcome;
    }
    return null;
  };

  return { isPwa, isInstallPromptAvailable, promptInstall };
}
