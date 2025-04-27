'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { setSidebarOpen } from '@/redux/features/ui/sidebar';

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
  dashboardLayoutContent: ReactNode | null;
  setDashboardLayoutContent: (content: ReactNode | null) => void;
  handleDashboardOpen: (state: boolean) => void;
  dashboardTitle: string;
  setDashboardTitle: (title: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  const sidebarOpen = useAppSelector((state) => state.sidebar.isOpen);

  const dispatchSetSidebarOpen = useCallback(
    (open: boolean) => {
      dispatch(setSidebarOpen(open));
    },
    [dispatch]
  );

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
        // Don't close the sidebar completely, just collapse it
        dispatchSetSidebarOpen(false);
        setWalletLensOpen(true);
        // Close Dashboard if it's open
        if (dashboardOpen) {
          setDashboardOpen(false);
        }
      } else {
        setWalletLensOpen(false);
      }
    },
    [dashboardOpen, dispatchSetSidebarOpen]
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
        dispatchSetSidebarOpen(false);
        setDashboardOpen(true);
      } else {
        setDashboardOpen(false);
      }
    },
    [walletLensOpen, dispatchSetSidebarOpen]
  );

  const value = {
    sidebarOpen,
    setSidebarOpen: dispatchSetSidebarOpen,
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
