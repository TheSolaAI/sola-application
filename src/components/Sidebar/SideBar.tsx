import { ChevronLeft, Edit, Edit2, Menu, User } from 'react-feather';
import { FC, useEffect, useRef, useState } from 'react';
import useThemeManager from '../../models/ThemeManager.ts';
import { useChat } from '../../hooks/useChatRoom.ts';
import { useRoomStore } from '../../models/RoomState.ts';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AgentSelect } from './AgentSelect.tsx';
import { EditRoom } from './EditRoom.tsx';
import { ProfileDropDown } from './ProfileDropDown.tsx';
import useIsMobile from '../utils/isMobile.tsx';
import { VscPinned } from 'react-icons/vsc';
import { ChartCandlestick } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  canAutoClose: boolean;
  setCanAutoClose: (autoClose: boolean) => void;
}

export const Sidebar: FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  canAutoClose,
  setCanAutoClose,
}) => {
  const navigate = useNavigate();

  /**
   * Refs
   */
  const sidebarRef = useRef<HTMLDivElement>(null);
  const agentSelectRef = useRef<HTMLButtonElement>(null);
  const editButtonRefs = useRef<{ [key: string]: HTMLButtonElement }>({});
  const profileRef = useRef<HTMLButtonElement>(null);

  /**
   * Global State
   */
  const { theme } = useThemeManager();
  const { getRooms } = useChat();
  const { rooms } = useRoomStore();
  const { pathname } = useLocation();

  /**
   * Local State
   */
  const [agentSelectOpen, setAgentSelectOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
  const isMobile = useIsMobile();

  /**
   * Open the sidebar when mouse hovers over the left edge
   * Only triggers if canAutoClose is true and we're on desktop
   */
  const handleMouseEnter = () => {
    if (!isMobile && !isOpen && canAutoClose) {
      setIsOpen(true);
      setAutoOpened(true);
    }
  };

  /**
   * Close the sidebar if it was auto-opened when mouse leaves
   * Only triggers if canAutoClose is true and the sidebar was auto-opened
   */
  const handleMouseLeave = () => {
    if (!isMobile && canAutoClose && autoOpened) {
      setIsOpen(false);
      setAutoOpened(false);
    }
  };

  /**
   * Close the sidebar when clicking outside.
   * On desktop, only closes if canAutoClose is true
   */
  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setAgentSelectOpen(false);
      setProfileOpen(false);

      // On mobile, always close
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  /**
   * Handle edit button click for a chat room
   */
  const handleEditClick = (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingRoom(editingRoom === roomId ? null : roomId);
  };

  /**
   * Runs at the load of the screen and sets up event listeners and loads the rooms from the server.
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    getRooms();
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/*Used to detect mouse over in collapsed mode - only shown if canAutoClose is true*/}
      {!isMobile && !isOpen && canAutoClose && (
        <div
          className="fixed left-0 top-0 h-full w-6 z-50"
          onMouseEnter={handleMouseEnter}
        />
      )}
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`transition-duration-500 fixed left-8 top-8 z-50 ease-in-out lg:hidden ${isOpen ? 'opacity-0' : 'opacity-100'}`}
      >
        <Menu size={24} color={theme.textColor} />
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`flex flex-col transition-all duration-300 ease-in-out bg-sec_background p-4 pt-6 shadow-black/25 shadow-[0px_0px_15px_1px] z-40 h-full rounded-lg
        ${isMobile ? 'fixed left-0 top-0 w-64' : 'lg:static lg:w-64'} 
        ${isOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'lg:-ml-64'}
        `}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold text-textColor">
            Sola AI
            <span className="fixed ml-2 rounded-full bg-primaryDark px-2 py-1 text-xs text-red-50">
              Beta
            </span>
          </h1>
          {/* Only show close button on mobile or if canAutoClose is true */}
          {(isMobile || canAutoClose) && (
            <button onClick={() => setIsOpen(false)} className="lg:hidden">
              <ChevronLeft size={24} color={theme.textColor} />
            </button>
          )}
          <img
            src="/logo.png"
            alt="Logo"
            className="hidden w-[40px] h-[40px] rounded-lg lg:block"
          />
        </div>

        {/*New ChatRoom Button*/}
        <button
          ref={agentSelectRef}
          className="group mt-10 flex items-center justify-center rounded-xl bg-background bg-gradient-to-r from-primary to-primaryDark p-[1px] transition-all duration-300 hover:scale-[102%] hover:shadow-[0px_0px_10px_1px] hover:shadow-primaryDark"
          onClick={() => setAgentSelectOpen(true)}
        >
          <div className="flex h-full w-full flex-row items-center justify-between rounded-xl bg-background p-3">
            <h1 className="text-textColor">New Chat</h1>
            <Edit size={16} color={theme.textColor} />
          </div>
        </button>

        <AgentSelect
          isOpen={agentSelectOpen}
          onClose={() => {
            setAgentSelectOpen(false);
            if (isMobile) setIsOpen(false);
          }}
          anchorEl={agentSelectRef.current}
          onSelect={() => {
            navigate(`/`);
            setAgentSelectOpen(false);
          }}
        />

        {/*  ChatRooms List - Now Scrollable */}
        <div className="mt-[10px] flex-1 pr-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-sec_background ">
          <div className="flex flex-col items-start space-y-2">
            {rooms.map((room) => {
              const isEditing = editingRoom === room.id;

              return (
                <div key={room.id} className="w-full">
                  <NavLink
                    to={`/c/${room.id}`}
                    onClick={() => {
                      if (isMobile) setIsOpen(false);
                    }}
                    className={`group font-small flex w-full items-center gap-3 rounded-xl p-3 transition-color duration-300 ease-in-out  
              ${pathname === `/c/${room.id}` || pathname.startsWith(`/c/${room.id}/`) ? 'bg-primary' : ''}`}
                  >
                    <ChartCandlestick
                      className={'w-4 h-4'}
                      color={theme.textColor}
                    />

                    <h1 className="text-textColor font-normal flex-1">
                      {room.name}
                    </h1>
                    <button
                      ref={(el) => el && (editButtonRefs.current[room.id] = el)}
                      onClick={(e) => handleEditClick(e, room.id)}
                      className={`transition-opacity duration-300 group-hover:opacity-100 
                ${pathname === `/c/${room.id}` || pathname.startsWith(`/c/${room.id}/`) ? 'lg:opacity-100' : 'lg:opacity-0'}`}
                    >
                      <Edit2 size={16} color={theme.textColor} />
                    </button>
                  </NavLink>

                  {isEditing && (
                    <EditRoom
                      isOpen={true}
                      onClose={() => setEditingRoom(null)}
                      anchorEl={editButtonRefs.current[room.id]}
                      roomID={room.id}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4">
          <div className="flex flex-row justify-center items-center gap-5 bg-gradient-to-r from-primaryDark to-primary p-[10px] rounded-xl mb-10  shadow-primaryDark ">
            <h1 className="font-semibold text-textColor">$SOLA :</h1>
            <h1 className={'font-bold text-textColor text-2xl'}> ∞</h1>
          </div>
          <div className="flex flex-row items-center justify-between">
            <button
              ref={profileRef}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <User size={24} color={theme.textColor} />
            </button>

            <button>
              {!isMobile && !canAutoClose ? (
                <ChevronLeft
                  size={24}
                  color={theme.textColor}
                  onClick={() => {
                    setIsOpen(false);
                    setCanAutoClose(true);
                  }}
                />
              ) : (
                <VscPinned
                  size={24}
                  color={theme.textColor}
                  onClick={() => {
                    setIsOpen(true);
                    setCanAutoClose(false);
                  }}
                />
              )}
            </button>
          </div>
          <ProfileDropDown
            anchorEl={profileRef.current!}
            isOpen={profileOpen}
            onClose={() => {
              setProfileOpen(false);
              if (isMobile) setIsOpen(false);
            }}
          />
        </div>
      </div>
    </>
  );
};
