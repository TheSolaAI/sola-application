import { useEffect, useState } from 'react';

function useKeyboardHeight(): {
  keyboardHeight: number;
  visibleHeight: number;
} {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [visibleHeight, setVisibleHeight] = useState<number>(
    window.innerHeight,
  );

  useEffect(() => {
    if (!window.visualViewport || !window.visualViewport.height) {
      //In the case when the browser doesn't support
      return;
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

  return { keyboardHeight, visibleHeight };
}

export default useKeyboardHeight;
