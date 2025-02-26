import { FC } from 'react';
import { Dropdown } from '../general/DropDown.tsx';
import { LogOut, Settings } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useSessionHandler } from '../../models/SessionHandler.ts';
import { useLayoutContext } from '../../layout/LayoutProvider.tsx';

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
   * Global State
   */
  const { setMediaStream, setPeerConnection, setMuted } = useSessionHandler();
  const { settingsIsOpen, setSettingsIsOpen } = useLayoutContext();

  /**
   * State Management
   */
  const { logout } = usePrivy();

  const logoutHandler = () => {
    // TODO: Close the session and datastream to OpenAI
    setMediaStream(null);
    setPeerConnection(null);
    setMuted(true);
    logout();
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      mobileTitle="Profile"
      direction="up"
      width="auto"
    >
      <div className="w-full p-2">
        {/*Settings*/}
        <button
          className="w-full hover:bg-primary/85 flex-row flex gap-4 items-center justify-between p-3 rounded-xl"
          onClick={() => {
            setSettingsIsOpen(!settingsIsOpen);
            onClose();
          }}
        >
          <h1 className="text-textColor font-medium text-md">Settings</h1>
          <Settings className="text-secText w-5 h-5" />
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
