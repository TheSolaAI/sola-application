import { ChevronLeft, Edit, Edit2, Menu, Settings, User } from 'react-feather';
import { useState, useEffect, useRef } from 'react';
import useThemeManager from '../../models/ThemeManager.ts';
import { useChat } from '../../hooks/useChatRoom.ts';
import { useRoomStore } from '../../models/RoomState.ts';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AgentSelect } from './AgentSelect.tsx';
import { EditRoom } from './EditRoom.tsx';
import useUser from '../../hooks/useUser.ts';

export const Sidebar = () => {
  const navigate = useNavigate();

  /**
   * Refs
   */
  const sidebarRef = useRef<HTMLDivElement>(null);
  const agentSelectRef = useRef<HTMLButtonElement>(null);
  const editButtonRefs = useRef<{ [key: string]: HTMLButtonElement }>({});

  /**
   * models
   */
  const { theme } = useThemeManager();
  const { getRooms } = useChat();
  const { rooms } = useRoomStore();
  const { pathname } = useLocation();
  const { user } = useUser();

  /**
   * Local State
   */
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [agentSelectOpen, setAgentSelectOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);

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
        className={`flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-70'} fixed bg-sec_background lg:static lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} z-40 h-full rounded-lg p-4 pt-6 lg:m-2 lg:h-[calc(100%-1rem)] shadow-black/25 shadow-[0px_0px_15px_1px]`}
      >
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
            src="../../../public/logo.png"
            alt="Logo"
            className="hidden w-[40px] h-[40px] rounded-lg lg:block"
          />
        </div>

        {/*New ChatRoom Button*/}
        <button
          ref={agentSelectRef}
          className="group mt-10 flex items-center justify-center rounded-xl bg-background bg-gradient-to-r from-primary to-primaryDark p-[1px] transition-all duration-300 hover:scale-[102%] hover:shadow-[0px_0px_10px_1px] hover:shadow-primaryDark "
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
          onSelect={(agentID) => {
            navigate(`/`);
            isMobileOpen && toggleMobile();
          }}
        />

        {/*  ChatRooms List*/}
        <div className="mt-[10px] flex flex-col items-start space-y-4">
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
                    className={` transition-opacity duration-300 group-hover:opacity-100 
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
        {/* Tokens Left Status */}
        <div className="flex flex-row justify-between gap-5 mt-auto bg-gradient-to-r from-primaryDark to-primary p-[10px] rounded-xl mb-6 items-center shadow-primaryDark shadow-[0px_0px_10px_3px]">
          <h1 className="font-medium text-textColor">Sola AI Tokens:</h1>
          <h1 className={'font-bold text-textColor text-3xl'}> 22</h1>
        </div>
        {/* Bottom Profile Opener */}
        <div
          className={
            'flex flex-row items-center justify-start gap-5 hover:bg-background rounded-xl p-3 cursor-pointer -m-2'
          }
        >
          <Settings size={24} color={theme.textColor} />
          <h1 className="text-secText font-semibold">Settings</h1>
        </div>
      </div>
    </>
  );
};
