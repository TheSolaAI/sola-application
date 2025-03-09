'use client';
import { useEffect, useState } from 'react';

function useKeyboardHeight(): {
  keyboardHeight: number;
  visibleHeight: number;
  isPWA: boolean;
} {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [visibleHeight, setVisibleHeight] = useState<number>(0); // Initialize to 0
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Set initial height after component mounts (client-side only)
    setVisibleHeight(window.innerHeight);

    if (!window.visualViewport || !window.visualViewport.height) {
      // In the case when the browser doesn't support
      return;
    }

    // Check for PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches
    ) {
      setIsPWA(true);
    }

    const handleResize = (): void => {
      // Calculate keyboard height by comparing viewport heights
      const keyboardHeight = window.innerHeight - window.visualViewport.height;
      setKeyboardHeight(keyboardHeight > 0 ? keyboardHeight : 0);
      setVisibleHeight(window.visualViewport.height);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () =>
      window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  return { keyboardHeight, visibleHeight, isPWA };
}

export default useKeyboardHeight;
