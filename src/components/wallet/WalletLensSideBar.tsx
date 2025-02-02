import React from 'react';

interface WalletLensSidebarProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const WalletLensSideBar: React.FC<WalletLensSidebarProps> = ({
  visible,
  setVisible,
}) => {
  return (
    <div
      className={`h-full bg-sec_background rounded-2xl transition-all duration-300 overflow-hidden
        ${visible ? 'w-[25%]' : 'w-0'}`}
    ></div>
  );
};
