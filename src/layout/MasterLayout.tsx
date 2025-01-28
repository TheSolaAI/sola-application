import React, { useState, ReactNode } from 'react';
import useAppState from '../store/zustand/AppState';
import Disclaimer from '../components/ui/Disclaimer';
import Sidebar from '../components/Sidebar';

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { disclaimer, setDisclaimer } = useAppState();
  return (
    <>
      <div className="">
        {/* <!-- ===== Page Wrapper Start ===== --> */}
        <Disclaimer isOpen={disclaimer} setIsOpen={setDisclaimer} />
        <div className="flex h-screen overflow-hidden">
          {/* <!-- ===== Sidebar Start ===== --> */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Sidebar End ===== --> */}

          {/* <!-- ===== Content Area Start ===== --> */}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {/* <!-- ===== Main Content Start ===== --> */}
            <main>
              <div className="mx-auto max-w-screen-2xl ">{children}</div>
            </main>
            {/* <!-- ===== Main Content End ===== --> */}
          </div>
          {/* <!-- ===== Content Area End ===== --> */}
        </div>
        {/* <!-- ===== Page Wrapper End ===== --> */}
      </div>
    </>
  );
};

export default MasterLayout;
