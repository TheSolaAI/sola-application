import React, { ReactNode } from 'react';
import { Sidebar } from '../components/sidebar/SideBar.tsx';
import { WalletLensSideBar } from '../components/wallet/WalletLensSideBar.tsx';
import { useLayoutContext } from './LayoutProvider.tsx';
import useIsMobile from '../utils/isMobile.tsx';
import { SettingsModal } from '../components/settings/SettingsPopup.tsx';
import { DashBoardContainer } from '../components/dashboards/DashboardContainer.tsx';

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    canAutoClose,
    setCanAutoClose,
    walletLensOpen,
    handleWalletLensOpen,
    dashboardOpen,
    handleDashboardOpen,
    dashboardLayoutContent,
    settingsIsOpen,
    setSettingsIsOpen,
  } = useLayoutContext();

  const isMobile = useIsMobile();

  return (
    <>
      <div className={`flex h-screen bg-baseBackground overflow-hidden sm:p-2`}>
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          canAutoClose={canAutoClose}
          setCanAutoClose={setCanAutoClose}
        />

        {(!isMobile || (!walletLensOpen && !dashboardOpen)) && (
          <main
            className={`
              transition-all duration-500
              ${dashboardOpen ? 'w-[25%]' : 'w-full'} 
              sm:rounded-2xl bg-background overflow-hidden
            `}
          >
            {children}
          </main>
        )}

        <DashBoardContainer
          visible={dashboardOpen}
          setVisible={handleDashboardOpen}
        >
          {dashboardLayoutContent}
        </DashBoardContainer>

        <WalletLensSideBar
          setVisible={handleWalletLensOpen}
          visible={walletLensOpen}
        />
      </div>

      <SettingsModal
        isOpen={settingsIsOpen}
        onClose={() => setSettingsIsOpen(false)}
      />
    </>
  );
};

export default MasterLayout;
