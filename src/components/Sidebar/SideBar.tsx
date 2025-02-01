import { ChevronLeft, Edit, Edit2, Menu, User } from 'react-feather';
import { useEffect, useRef, useState } from 'react';
import useThemeManager from '../../models/ThemeManager.ts';
import { useChat } from '../../hooks/useChatRoom.ts';
import { useRoomStore } from '../../models/RoomState.ts';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AgentSelect } from './AgentSelect.tsx';
import { EditRoom } from './EditRoom.tsx';
import { usePrivy } from '@privy-io/react-auth';
import { ProfileDropDown } from './ProfileDropDown.tsx';

export const Sidebar = () => {
  const navigate = useNavigate();

  /**
   * Refs
   */
  const sidebarRef = useRef<HTMLDivElement>(null);
  const agentSelectRef = useRef<HTMLButtonElement>(null);
  const editButtonRefs = useRef<{ [key: string]: HTMLButtonElement }>({});
  const profileRef = useRef<HTMLButtonElement>(null);

  /**
   * models
   */
  const { theme } = useThemeManager();
  const { getRooms } = useChat();
  const { rooms } = useRoomStore();
  const { pathname } = useLocation();
  const { user } = usePrivy();

  /**
   * Local State
   */
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [agentSelectOpen, setAgentSelectOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  /**
   * Fully opens or closes the sidebar. Only called in mobile view.
   */
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  /**
   * Close the sidebar when clicking outside.
   */
  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setIsMobileOpen(false);
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
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className={`transition-duration-500 fixed left-8 top-8 z-50 ease-in-out lg:hidden ${isMobileOpen ? 'opacity-0' : 'opacity-100'}`}
      >
        <Menu size={24} color={theme.textColor} />
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`flex flex-col transition-all duration-300 ease-in-out fixed bg-sec_background lg:static lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} z-40 h-full rounded-lg p-4 pt-6 lg:m-2 lg:h-[calc(100%-1rem)] shadow-black/25 shadow-[0px_0px_15px_1px]`}
      >
        {/* Header */}
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold text-textColor">
            Sola AI
            <span className="fixed ml-2 rounded-full bg-red-500 px-2 py-1 text-xs text-red-50">
              Beta
            </span>
          </h1>
          <button onClick={toggleMobile} className="lg:hidden">
            <ChevronLeft size={24} color={theme.textColor} />
          </button>
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
          onClose={() => setAgentSelectOpen(false)}
          anchorEl={agentSelectRef.current}
          onSelect={() => {
            navigate(`/`);
            isMobileOpen && toggleMobile();
          }}
        />

        {/*  ChatRooms List - Now Scrollable */}
        <div className="mt-[10px] flex-1 overflow-y-auto">
          <div className="flex flex-col items-start space-y-2">
            {rooms.map((room) => {
              const isEditing = editingRoom === room.id;

              return (
                <div key={room.id} className="w-full">
                  <NavLink
                    to={`/c/${room.id}`}
                    className={`group font-small flex w-full items-center gap-3 rounded-xl p-3 transition-color duration-300 ease-in-out  
              ${pathname === `/c/${room.id}` || pathname.startsWith(`/c/${room.id}/`) ? 'bg-background' : ''}`}
                  >
                    <img
                      src={'https://avatar.iran.liara.run/public/43'}
                      alt={'agent-image'}
                      className={'w-10 h-10'}
                    />
                    <h1 className="text-textColor font-medium flex-1">
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
          <div className="flex flex-row justify-between gap-5 bg-gradient-to-r from-primaryDark to-primary p-[10px] rounded-xl mb-10 items-center shadow-primaryDark shadow-[0px_0px_10px_1px]">
            <h1 className="font-medium text-textColor">Sola AI Tokens:</h1>
            <h1 className={'font-bold text-textColor text-3xl'}> ∞</h1>
          </div>
          <button
            className={
              'flex flex-row items-center justify-start gap-5 hover:bg-background rounded-xl p-3 cursor-pointer -m-2'
            }
            ref={profileRef}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <User size={24} color={theme.textColor} />
            <h1 className="text-secText font-semibold">
              {user?.email?.address}
            </h1>
          </button>
          <ProfileDropDown
            anchorEl={profileRef.current!}
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
          />
        </div>
      </div>
    </>
  );
};
