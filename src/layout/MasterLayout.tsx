// MasterLayout.tsx
import React, { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar/SideBar.tsx';
import { WalletLensSideBar } from '../components/wallet/WalletLensSideBar.tsx';
import { useLayoutContext } from './LayoutProvider.tsx';
import useIsMobile from '../utils/isMobile.tsx';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDashboardHandler } from '../models/DashboardHandler.ts';

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    canAutoClose,
    setCanAutoClose,
    walletLensOpen,
    handleWalletLensOpen,
  } = useLayoutContext();
  const { isOpen } = useDashboardHandler();

  const isMobile = useIsMobile();

  return (
    <div className={`flex h-screen bg-baseBackground overflow-hidden sm:p-2`}>
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        canAutoClose={canAutoClose}
        setCanAutoClose={setCanAutoClose}
      />
      <PanelGroup autoSaveId="conditional" direction="horizontal">
        {(!isMobile || !walletLensOpen) && (
          <Panel id="leftormiddle" minSize={35} order={1}>
            <main className="w-full sm:rounded-2xl bg-background overflow-hidden">
              {children}
            </main>
          </Panel>
        )}
        {isOpen && (
          <>
            <PanelResizeHandle />
            <Panel id="right" order={2}>
              hola
            </Panel>
          </>
        )}
      </PanelGroup>

      <WalletLensSideBar
        setVisible={handleWalletLensOpen}
        visible={walletLensOpen}
      />
    </div>
  );
};

export default MasterLayout;
