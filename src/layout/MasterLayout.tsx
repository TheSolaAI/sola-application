// MasterLayout.tsx
import React, { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar/SideBar.tsx';
import { WalletLensSideBar } from '../components/wallet/WalletLensSideBar.tsx';
import { useLayoutContext } from './LayoutProvider.tsx';
import useIsMobile from '../components/utils/isMobile.tsx';

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    canAutoClose,
    setCanAutoClose,
    walletLensOpen,
    handleWalletLensOpen,
  } = useLayoutContext();

  const isMobile = useIsMobile();

  return (
    <div className={`flex h-screen bg-baseBackground overflow-hidden sm:p-2`}>
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        canAutoClose={canAutoClose}
        setCanAutoClose={setCanAutoClose}
      />
      {!isMobile || !walletLensOpen ? (
        <main className="w-full sm:rounded-2xl bg-background">{children}</main>
      ) : (
        <></>
      )}
      <WalletLensSideBar
        setVisible={handleWalletLensOpen}
        visible={walletLensOpen}
      />
    </div>
  );
};

export default MasterLayout;
