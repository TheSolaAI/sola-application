// LayoutContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  walletLensOpen: boolean;
  setWalletLensOpen: React.Dispatch<React.SetStateAction<boolean>>;
  canAutoClose: boolean;
  setCanAutoClose: React.Dispatch<React.SetStateAction<boolean>>;
  handleWalletLensOpen: (state: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [walletLensOpen, setWalletLensOpen] = useState(false);
  const [canAutoClose, setCanAutoClose] = useState(false);

  const handleWalletLensOpen = (state: boolean) => {
    if (state) {
      setSidebarOpen(false);
      setWalletLensOpen(true);
      setCanAutoClose(true);
    } else {
      if (!canAutoClose) {
        setSidebarOpen(true);
      }
      setWalletLensOpen(false);
    }
  };

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        walletLensOpen,
        setWalletLensOpen,
        canAutoClose,
        setCanAutoClose,
        handleWalletLensOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};
