'use client';

import React, { ReactNode, useCallback, useMemo } from 'react';
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

  const mainContentVariants = useMemo(
    () => ({
      expanded: {
        width: '100%',
        transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
      },
      collapsed: {
        width: dashboardOpen ? '25%' : '75%',
        transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
      },
    }),
    [dashboardOpen]
  );

  const renderMainContent = useCallback(() => {
    if (isMobile && (walletLensOpen || dashboardOpen)) {
      return null;
    }

    return (
      <motion.div
        variants={mainContentVariants}
        initial={false}
        animate={walletLensOpen ? 'collapsed' : 'expanded'}
        className="sm:rounded-2xl bg-background overflow-hidden"
      >
        {children}
      </motion.div>
    );
  }, [isMobile, walletLensOpen, dashboardOpen, children, mainContentVariants]);

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
        {renderMainContent()}

        {/* Dashboard Container*/}
        <AnimatePresence mode="wait">
          {dashboardOpen && (
            <DashBoardContainer
              visible={dashboardOpen}
              setVisible={handleDashboardOpen}
            >
              {dashboardLayoutContent}
            </DashBoardContainer>
          )}
        </AnimatePresence>

        {/* Wallet Lens Sidebar*/}
        <AnimatePresence mode="wait">
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
