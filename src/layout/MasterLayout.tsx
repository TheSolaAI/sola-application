import React, { ReactNode } from 'react';
import useAppState from '../models/AppState.ts';
import Disclaimer from '../components/ui/Disclaimer';
import { Sidebar } from '../components/Sidebar/SideBar.tsx';

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { disclaimer, setDisclaimer } = useAppState();
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/*<Disclaimer isOpen={disclaimer} setIsOpen={setDisclaimer} />*/}
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default MasterLayout;
