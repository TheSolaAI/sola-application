import React, { ReactNode, useState } from 'react';
import { Sidebar } from '../components/Sidebar/SideBar.tsx';

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const { disclaimer, setDisclaimer } = useAppState();

  /**
   * Local State
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [canAutoClose, setCanAutoClose] = useState(false);
  const [walletLensOpen, setWalletLensOpen] = useState(false);

  return (
    <div className="flex h-screen bg-baseBackground overflow-hidden sm:p-2 gap-x-2">
      {/*<Disclaimer isOpen={disclaimer} setIsOpen={setDisclaimer} />*/}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        canAutoClose={canAutoClose}
        setCanAutoClose={setCanAutoClose}
      />
      <main className="w-full sm:rounded-2xl bg-background">{children}</main>
      {/*<WalletLensSideBar />*/}
    </div>
  );
};

export default MasterLayout;
