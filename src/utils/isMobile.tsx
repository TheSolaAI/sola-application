'use client';
import { useEffect, useState } from 'react';

const useIsMobile = (breakpoint = 640) => {
  // Use null as initial state to indicate "not determined yet"
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Now we're on the client, we can safely check window
    setIsMobile(window.innerWidth < breakpoint);

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  // Return false during SSR, and the actual value during CSR
  return isMobile === null ? false : isMobile;
};

export default useIsMobile;
