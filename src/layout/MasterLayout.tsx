import React, { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar/SideBar.tsx';
import { WalletLensSideBar } from '../components/wallet/WalletLensSideBar.tsx';
import { useLayoutContext } from './LayoutProvider.tsx';
import useIsMobile from '../utils/isMobile.tsx';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDashboardHandler } from '../models/DashboardHandler.ts';
import WalletLensButton from '../components/wallet/WalletLensButton.tsx';
import { GoatIndexDashboard } from '../components/dashboard/GoatIndexDashboard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenDataDashboard } from '../components/dashboard/TokenDataDashboard.tsx';

const slideRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
  transition: { type: 'spring', stiffness: 200, damping: 30 },
};

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    canAutoClose,
    setCanAutoClose,
    walletLensOpen,
    handleWalletLensOpen,
  } = useLayoutContext();
  const { isOpen, dashboardType } = useDashboardHandler();
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-baseBackground overflow-hidden sm:p-2">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        canAutoClose={canAutoClose}
        setCanAutoClose={setCanAutoClose}
      />

      <PanelGroup
        className="relative"
        autoSaveId="conditional"
        direction="horizontal"
      >
        <div className="absolute t-3 right-2 z-10">
          <WalletLensButton
            onClick={() => handleWalletLensOpen(!walletLensOpen)}
          />
        </div>

        {(!isMobile || !walletLensOpen) && (
          <Panel id="leftormiddle" minSize={40} defaultSize={45} order={1}>
            <main className="w-full sm:rounded-2xl bg-background overflow-hidden">
              {children}
            </main>
          </Panel>
        )}

        <AnimatePresence>
          {isOpen && !isMobile && (
            <>
              <PanelResizeHandle className="w-1" />
              <Panel id="right" order={2} minSize={30}>
                <motion.main
                  className="w-full h-full sm:rounded-2xl bg-background overflow-hidden"
                  {...slideRight}
                >
                  {dashboardType === 'goatIndex' && <GoatIndexDashboard />}
                  {dashboardType === 'tokenData' && <TokenDataDashboard />}
                </motion.main>
              </Panel>
            </>
          )}
        </AnimatePresence>
      </PanelGroup>

      <WalletLensSideBar
        setVisible={handleWalletLensOpen}
        visible={walletLensOpen}
      />
    </div>
  );
};

export default MasterLayout;
