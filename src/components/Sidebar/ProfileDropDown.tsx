import { FC } from 'react';
import { Dropdown } from '../general/DropDown.tsx';
import { LogOut, Settings, CreditCard } from 'lucide-react';
import useChatState from '../../models/ChatState.ts';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

interface ProfileDropDownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement;
}

export const ProfileDropDown: FC<ProfileDropDownProps> = ({
  anchorEl,
  isOpen,
  onClose,
}) => {
  /**
   * State Management
   */

  const {
    getPeerConnection,
    dataChannel,
    setPeerConnection,
    setIsSessionActive,
    setDataChannel,
  } = useChatState();
  const { logout } = usePrivy();
  const navigation = useNavigate();

  const logoutHandler = () => {
    const pc = getPeerConnection();

    if (dataChannel) {
      dataChannel.close();
    }
    if (pc) {
      pc.close();
      setPeerConnection(null);
    }

    setIsSessionActive(false);
    setDataChannel(null);

    logout();
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      title="Profile"
      mobileTitle="Profile"
      direction="up"
      width="auto"
    >
      <div className="w-full">
        {/*Settings*/}
        <button
          className="w-full hover:bg-primary/85 flex-row flex items-center justify-between p-3 rounded-xl"
          onClick={() => {
            //   Navigate to settings page
            navigation('/settings/configuration');
            onClose();
          }}
        >
          <h1 className="text-textColor font-medium text-md">Settings</h1>
          <Settings className="text-secText w-5 h-5" />
        </button>
        <button
          className="w-full hover:bg-surface flex-row flex items-center justify-between p-3 rounded-xl gap-x-5"
          onClick={() => {
            //   Navigate to wallet configuration page
            navigation('/wallet');
            onClose();
          }}
        >
          <h1 className="text-textColor text-left font-medium text-md">
            Wallet Configuration
          </h1>
          <CreditCard className="text-secText w-5 h-5" />
        </button>
        <button
          className="w-full hover:bg-surface flex-row flex items-center justify-between p-3 rounded-xl"
          onClick={logoutHandler}
        >
          <h1 className="text-red-400 font-medium text-md">Logout</h1>
          <LogOut className="text-red-400 w-5 h-5" />
        </button>
      </div>
    </Dropdown>
  );
};
