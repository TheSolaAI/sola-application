import React, { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar/SideBar.tsx';

const MasterLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className='w-full'>{children}</main>
    </div>
  );
};

export default MasterLayout;
