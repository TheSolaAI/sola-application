'use client';
import { FC } from 'react';
import { Dropdown } from '@/components/common/DropDown';
import { useLogout } from '@privy-io/react-auth';
import { useSessionHandler } from '@/store/SessionHandler';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { FaGithub } from 'react-icons/fa';
import { IoSettings } from 'react-icons/io5';
import { SiGoogledocs } from 'react-icons/si';
import { MdOutlineLogout } from 'react-icons/md';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
  const {
    mediaStream,
    setMediaStream,
    peerConnection,
    setPeerConnection,
    dataStream,
    setDataStream,
    setMuted,
  } = useSessionHandler();
  const { settingsIsOpen, setSettingsIsOpen } = useLayoutContext();
  const router = useRouter();

  /**
   * State Management
   */
  const { logout } = useLogout({
    onSuccess: () => {
      router.push('/');
      toast.success('successfully logged out');
    },
  });

  const logoutHandler = () => {
    if (dataStream) {
      dataStream.close();
      setDataStream(null);
    }

    // 2. Stop all tracks in the media stream
    if (mediaStream) {
      console.log('Stopping media stream tracks...');
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
    }

    // 3. Close the peer connection
    if (peerConnection) {
      console.log('Closing peer connection...');
      peerConnection.close();
      setPeerConnection(null);
    }
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
      <div className="w-full p-1">
        {/*Settings*/}
        <button
          className="w-full hover:bg-primary/85 flex-row flex gap-4 items-center justify-between px-3 py-2 rounded-lg"
          onClick={() => {
            setSettingsIsOpen(!settingsIsOpen);
            onClose();
          }}
        >
          <h1 className="text-textColor font-medium text-md">Settings</h1>
          <IoSettings className="text-secText w-5 h-5" />
        </button>
        <button
          className="w-full hover:bg-primary/85 flex-row flex gap-4 items-center justify-between px-3 py-2 rounded-lg"
          onClick={() => {
            window.open(
              'https://docs.solaai.xyz/',
              '_blank',
              'noopener,noreferrer'
            );
          }}
        >
          <h1 className="text-textColor font-medium text-md">Docs</h1>
          <SiGoogledocs className="text-secText w-5 h-5" />
        </button>
        <button
          className="w-full hover:bg-primary/85 flex-row flex gap-4 items-center justify-between px-3 py-2 rounded-lg"
          onClick={() => {
            window.open(
              'https://github.com/TheSolaAI/sola-application',
              '_blank',
              'noopener,noreferrer'
            );
          }}
        >
          <h1 className="text-textColor font-medium text-md">Github</h1>
          <FaGithub className="text-secText w-5 h-5" />
        </button>
        <button
          className="w-full hover:bg-surface flex-row flex items-center justify-between px-3 py-2 rounded-lg"
          onClick={logoutHandler}
        >
          <h1 className="text-red-400 font-medium text-md">Logout</h1>
          <MdOutlineLogout className="text-red-400 w-5 h-5" />
        </button>
      </div>
    </Dropdown>
  );
};
