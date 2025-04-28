'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

interface LayoutContextType {
  // Sidebar states
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Wallet lens states
  walletLensOpen: boolean;
  handleWalletLensOpen: (state: boolean) => void;

  // Audio states
  audioIntensity: number;
  setAudioIntensity: (intensity: number) => void;
  audioEl: HTMLAudioElement | null;

  // Settings states
  settingsIsOpen: boolean;
  setSettingsIsOpen: (open: boolean) => void;

  // Dashboard states
  dashboardOpen: boolean;
  handleDashboardOpen: (state: boolean) => void;
  dashboardLayoutContent: ReactNode | null;
  setDashboardLayoutContent: (content: ReactNode | null) => void;
  dashboardTitle: string;
  setDashboardTitle: (title: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Wallet lens state
  const [walletLensOpen, setWalletLensOpen] = useState(false);

  // Audio state
  const [audioIntensity, setAudioIntensity] = useState(0);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  // Settings state
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  // Dashboard state
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardLayoutContent, setDashboardLayoutContent] =
    useState<ReactNode | null>(null);
  const [dashboardTitle, setDashboardTitle] = useState<string>('');

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize audio element once on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.setAttribute('playsinline', 'true');
      setAudioEl(audio);
    }
  }, []);

  const handleWalletLensOpen = useCallback(
    (state: boolean) => {
      if (state) {
        setSidebarOpen(false);
        setWalletLensOpen(true);
        if (dashboardOpen) {
          setDashboardOpen(false);
        }
      } else {
        setWalletLensOpen(false);
      }
    },
    [dashboardOpen]
  );

  /**
   * Handler for opening and closing the Dashboard component
   */
  const handleDashboardOpen = useCallback(
    (state: boolean) => {
      if (state) {
        // Close wallet lens and collapse the sidebar
        if (walletLensOpen) {
          setWalletLensOpen(false);
        }
        setSidebarOpen(false);
        setDashboardOpen(true);
      } else {
        setDashboardOpen(false);
      }
    },
    [walletLensOpen]
  );

  const value = {
    sidebarOpen,
    setSidebarOpen,
    walletLensOpen,
    handleWalletLensOpen,
    audioIntensity,
    setAudioIntensity,
    audioEl,
    settingsIsOpen,
    setSettingsIsOpen,
    dashboardOpen,
    dashboardLayoutContent,
    setDashboardLayoutContent,
    handleDashboardOpen,
    dashboardTitle,
    setDashboardTitle,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};

export const useLayoutContext = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};
