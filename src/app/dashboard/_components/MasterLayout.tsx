'use client';

import React, { ReactNode, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { Sidebar } from '@/app/dashboard/_components/sidebar/SideBar';
import { WalletLensSideBar } from '@/app/dashboard/_components/wallet/WalletLensSideBar';
import { SettingsModal } from '@/app/dashboard/_components/settings/SettingsPopup';
import { DashBoardContainer } from '@/app/dashboard/_components/dashboards/DashboardContainer';
import useIsMobile from '@/utils/isMobile';

interface MasterLayoutProps {
  children: ReactNode;
}

const MasterLayout: React.FC<MasterLayoutProps> = ({ children }) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    canAutoClose,
    setCanAutoClose,
    walletLensOpen,
    handleWalletLensOpen,
    dashboardOpen,
    dashboardLayoutContent,
    handleDashboardOpen,
    settingsIsOpen,
    setSettingsIsOpen,
  } = useLayoutContext();

  const isMobile = useIsMobile();

  // Memoize content display logic to prevent unnecessary re-renders
  const renderMainContent = useCallback(() => {
    if (isMobile && (walletLensOpen || dashboardOpen)) {
      return null;
    }

    return (
      <motion.main
        layout
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          transition-all duration-300
          ${dashboardOpen ? 'w-[25%]' : 'w-full'} 
          sm:rounded-2xl bg-background overflow-hidden
        `}
      >
        {children}
      </motion.main>
    );
  }, [isMobile, walletLensOpen, dashboardOpen, children]);

  return (
    <>
      <div className="flex h-screen bg-baseBackground overflow-hidden sm:p-2">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          canAutoClose={canAutoClose}
          setCanAutoClose={setCanAutoClose}
        />

        {/* Main Content Area */}
        <AnimatePresence mode="wait">{renderMainContent()}</AnimatePresence>

        {/* Dashboard Container with AnimatePresence */}
        <AnimatePresence>
          {dashboardOpen && (
            <DashBoardContainer
              visible={dashboardOpen}
              setVisible={handleDashboardOpen}
            >
              {dashboardLayoutContent}
            </DashBoardContainer>
          )}
        </AnimatePresence>

        {/* Wallet Lens Sidebar with AnimatePresence */}
        <AnimatePresence>
          {walletLensOpen && (
            <WalletLensSideBar
              setVisible={handleWalletLensOpen}
              visible={walletLensOpen}
            />
          )}
        </AnimatePresence>
      </div>

      <SettingsModal
        isOpen={settingsIsOpen}
        onClose={() => setSettingsIsOpen(false)}
      />
    </>
  );
};

export default MasterLayout;
