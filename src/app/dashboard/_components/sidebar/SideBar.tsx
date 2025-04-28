'use client';
import { LuUser, LuMenu, LuEllipsis, LuPlus } from 'react-icons/lu';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import useThemeManager from '@/store/ThemeManager';
import { usePathname, useRouter } from 'next/navigation';
import { ProfileDropDown } from '@/app/dashboard/_components/sidebar/ProfileDropDown';
import { EditRoom } from '@/app/dashboard/_components/sidebar/EditRoom';
import useIsMobile from '@/utils/isMobile';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ChatRoom } from '@/types/chatRoom';
import { BiSolidCapsule } from 'react-icons/bi';
import { FaAngleDoubleLeft } from 'react-icons/fa';
import { useAppSelector } from '@/redux/hook';
import { useSessionManagerHandler } from '@/store/SessionManagerHandler';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  /**
   * Refs
   */
  const sidebarRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLButtonElement>(null);
  const editButtonRefs = useRef<{ [key: string]: HTMLButtonElement }>({});

  /**
   * Global State
   */
  const { theme } = useThemeManager();
  const { rooms, setCurrentChatRoom } = useChatRoomHandler();
  const pathname = usePathname();
  const { walletLensOpen } = useLayoutContext();
  const router = useRouter();
  const tier = useAppSelector((state) => state.tier.userTier?.tier);
  const { setShowVerifyHoldersPopup } = useSessionManagerHandler();

  /**
   * Local State
   */
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const isMobile = useIsMobile();
  const [hoverMenuButton, setHoverMenuButton] = useState(false);
  const [showExpandedElements, setShowExpandedElements] = useState(isOpen);

  // transition controls
  useEffect(() => {
    if (isOpen) {
      setShowExpandedElements(true);
    } else {
      // When closing, delay hiding elements until animation completes
      const timer = setTimeout(() => {
        setShowExpandedElements(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /**
   * Handle clicking on a chat room
   */
  const handleRoomClick = useCallback(
    (room: ChatRoom) => {
      if (isMobile) setIsOpen(false);
      setCurrentChatRoom(room);
    },
    [isMobile, setIsOpen, setCurrentChatRoom]
  );

  /**
   * Handle toggling the sidebar open/closed
   */
  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  /**
   * Handle edit button click for a chat room
   */
  const handleEditClick = useCallback(
    (e: React.MouseEvent, roomId: number) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingRoom(editingRoom === roomId ? null : roomId);
    },
    [editingRoom]
  );

  /**
   * Close the sidebar when clicking outside.
   * On mobile, always close
   */
  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setProfileOpen(false);
      setEditingRoom(null);
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  /**
   * Sets up listener to close when clicking outside of the sidebar
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className={`transition-duration-500 fixed left-4 top-4 z-50 ease-in-out lg:hidden ${
          isOpen || walletLensOpen ? 'opacity-0 hidden' : 'opacity-100 visible'
        }`}
      >
        <LuMenu size={24} color={theme.textColor} />
      </button>

      {/* Sidebar - on mobile it should be completely hidden when closed */}
      <div
        ref={sidebarRef}
        className={`flex flex-col transition-all duration-300 ease-in-out z-40 h-full overflow-hidden border-r-[1px] border-border
          ${
            isMobile
              ? `fixed left-0 top-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-80`
              : `lg:static ${isOpen ? 'w-80' : 'w-20'}`
          }
          ${
            isOpen
              ? 'bg-sec_background rounded-l-2xl p-3 pt-6'
              : isMobile
                ? 'bg-sec_background rounded-xl p-4 pt-6'
                : 'bg-sec_background rounded-l-2xl p-2 pt-6'
          }
        `}
      >
        <div className="relative flex flex-col h-full">
          <div className="h-10 mb-4 relative">
            {/* Expanded state header */}
            {showExpandedElements && (
              <div
                className={`absolute inset-0 flex justify-between items-center ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              >
                <h1 className="text-2xl font-bold text-textColor whitespace-nowrap">
                  Sola AI
                  <span className="absolute ml-2 rounded-full bg-primaryDark px-2 py-1 text-xs text-red-50">
                    Beta
                  </span>
                </h1>

                <button
                  onClick={toggleSidebar}
                  className="text-textColor hover:text-primaryDark transition-colors p-1 rounded-md hover:bg-background active:bg-primary/20"
                >
                  <FaAngleDoubleLeft size={20} />
                </button>
              </div>
            )}

            {/* Collapsed state header - HAMBURGER MENU */}
            <div
              className={`absolute inset-0 flex justify-center items-center ${!isOpen && !isMobile ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              style={{ pointerEvents: !isOpen && !isMobile ? 'auto' : 'none' }}
            >
              <button
                onClick={toggleSidebar}
                onMouseEnter={() => setHoverMenuButton(true)}
                onMouseLeave={() => setHoverMenuButton(false)}
                className={`p-2 rounded-md transition-all duration-200 ${hoverMenuButton ? 'bg-primary' : 'hover:bg-background'} active:scale-95`}
              >
                <LuMenu size={24} className="text-textColor" />
              </button>
            </div>
          </div>

          <div className="h-12 mb-6 relative">
            {/* Expanded state button */}
            {showExpandedElements && (
              <div
                className={`absolute inset-0 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              >
                <button
                  className="w-full h-full group flex items-center justify-center rounded-xl p-[2px] transition-all duration-300 active:scale-95
                    bg-background bg-gradient-to-r from-primary to-primaryDark hover:shadow-primaryDark"
                  onClick={() => {
                    setCurrentChatRoom(null);
                    useChatMessageHandler.getState().messages = [];
                    router.push('/dashboard/chat');
                  }}
                >
                  <div className="flex h-full w-full rounded-xl bg-background flex-row items-center justify-center gap-4 p-2">
                    <h1 className="text-textColor">New Chat</h1>
                    <LuPlus className="text-textColor" />
                  </div>
                </button>
              </div>
            )}

            {/* Collapsed state button */}
            <div
              className={`absolute inset-0 flex justify-center items-center ${!isOpen && !isMobile ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              style={{ pointerEvents: !isOpen && !isMobile ? 'auto' : 'none' }}
            >
              <button
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300 active:scale-95"
                onClick={() => {
                  setCurrentChatRoom(null);
                  useChatMessageHandler.getState().messages = [];
                  router.push('/dashboard/chat');
                }}
              >
                <LuPlus size={24} className="text-textColor" />
              </button>
            </div>
          </div>

          {showExpandedElements && (
            <>
              {/* Pump Terminal Header */}
              <div
                className={`mb-6 px-2 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              >
                <div className="flex items-center gap-2 text-secText">
                  <BiSolidCapsule size={16} />
                  <span className="text-sm whitespace-nowrap text-secText font-light">
                    Pump Terminal (Soon)
                  </span>
                </div>
              </div>

              {/* Chat Rooms List */}
              <div
                className={`flex-1 py-2 overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              >
                {/* Recents Header */}
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-secText text-md font-medium">
                    Recents
                  </span>
                </div>

                <div className="h-full overflow-y-auto">
                  <div className="flex flex-col items-start gap-y-1">
                    {rooms.map((room) => {
                      if (!room.id) return null;
                      const isActive =
                        pathname === `/dashboard/chat/${room.id}`;

                      return (
                        <div key={room.id} className="w-full">
                          <div
                            onClick={() => handleRoomClick(room)}
                            className={`group transition-all duration-200 ease-in-out rounded-lg w-full p-[10px] flex justify-between items-center relative
                ${isActive ? 'bg-baseBackground' : 'hover:bg-primary/20 active:bg-primary/30'}
              `}
                          >
                            <h1 className="text-textColor font-normal text-sm truncate flex-1 text-left">
                              {room.name.charAt(0).toUpperCase() +
                                room.name.slice(1)}
                            </h1>

                            {/* Edit button */}
                            <button
                              ref={(el) => {
                                if (el) editButtonRefs.current[room.id!] = el;
                              }}
                              onClick={(e) => handleEditClick(e, room.id!)}
                              className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-primary/30
                  ${isActive ? 'opacity-100' : ''}`}
                            >
                              <LuEllipsis size={16} color={theme.textColor} />
                            </button>
                          </div>

                          {/* Edit Room Dropdown */}
                          {editingRoom === room.id && (
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
              </div>
            </>
          )}

          {/* This provides the empty space in collapsed view */}
          {!isOpen && !isMobile && <div className="flex-1" />}

          <div
            className="h-12 mb-6 mt-4 relative cursor-pointer"
            onClick={() => setShowVerifyHoldersPopup(true)}
          >
            {/* Expanded state tier */}
            {showExpandedElements && (
              <div
                className={`absolute inset-0 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              >
                <div className="flex flex-row justify-center items-center gap-3 bg-baseBackground border-border border-2 p-[10px] rounded-xl shadow-primaryDark truncate h-full">
                  <h1 className="font-semibold text-textColor">Tier:</h1>
                  <h1 className="font-bold text-textColor text-xl">{tier}</h1>
                </div>
              </div>
            )}

            {/* Collapsed state tier */}
            <div
              className={`absolute inset-0 flex justify-center items-center ${!isOpen && !isMobile ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              style={{ pointerEvents: !isOpen && !isMobile ? 'auto' : 'none' }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/30 hover:bg-primary/40 flex items-center justify-center transition-colors">
                <span className="text-sm font-bold text-textColor">{tier}</span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION 2 - Profile + Dashboard (fixed position in collapsed state) */}
          <div className="h-10 mb-2 relative">
            {/* Expanded state profile section */}
            {showExpandedElements && (
              <div
                className={`absolute inset-0 flex items-center justify-between ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              >
                <button
                  ref={profileRef}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full bg-surface hover:bg-surface/80 flex items-center justify-center transition-colors active:scale-95"
                >
                  <LuUser size={18} color={theme.textColor} />
                </button>
              </div>
            )}

            {/* Collapsed state profile button */}
            <div
              className={`absolute inset-0 flex justify-center items-center ${!isOpen && !isMobile ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
              style={{ pointerEvents: !isOpen && !isMobile ? 'auto' : 'none' }}
            >
              <button
                ref={!isOpen ? profileRef : undefined}
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-12 h-12 rounded-full bg-surface hover:bg-surface/80 flex items-center justify-center transition-colors active:scale-95"
              >
                <LuUser size={20} color={theme.textColor} />
              </button>
            </div>

            {/* Profile Dropdown (works with both states) */}
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
      </div>
    </>
  );
};
