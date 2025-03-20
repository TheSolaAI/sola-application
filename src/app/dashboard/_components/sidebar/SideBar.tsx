'use client';
import { LuChevronLeft, LuEllipsis, LuMenu, LuUser } from 'react-icons/lu';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import useThemeManager from '@/store/ThemeManager';
import { usePathname, useRouter } from 'next/navigation';
import { EditRoom } from '@/app/dashboard/_components/sidebar/EditRoom';
import { ProfileDropDown } from '@/app/dashboard/_components/sidebar/ProfileDropDown';
import useIsMobile from '@/utils/isMobile';
import { VscPinned, VscAdd } from 'react-icons/vsc';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useCreditHandler } from '@/store/CreditHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';

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
  const { rooms, setCurrentChatRoom } = useChatRoomHandler();
  const pathname = usePathname();
  const { walletLensOpen } = useLayoutContext();
  const { credits } = useCreditHandler();
  const router = useRouter();

  /**
   * Local State
   */
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
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
      setProfileOpen(false);
      setEditingRoom(null);
    }
  };

  /**
   * Close the sidebar when clicking outside.
   * On desktop, only closes if canAutoClose is true
   */
  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
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
  const handleEditClick = useCallback(
    (e: React.MouseEvent, roomId: number) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingRoom(editingRoom === roomId ? null : roomId);
    },
    [editingRoom]
  );

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
      {/* Detect mouse over in collapsed mode - shown only if canAutoClose is true */}
      {!isMobile && !isOpen && canAutoClose && (
        <div
          className="fixed left-0 top-0 h-full w-10 z-50"
          onMouseEnter={handleMouseEnter}
        />
      )}
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`transition-duration-500 fixed left-4 top-4 z-50 ease-in-out lg:hidden ${
          isOpen || walletLensOpen ? 'opacity-0 hidden' : 'opacity-100 visible'
        }`}
      >
        <LuMenu size={24} color={theme.textColor} />
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`flex flex-col transition-all duration-300 ease-in-out bg-sec_background p-4 pt-6 shadow-black/25 shadow-[0px_0px_15px_1px] z-40 h-full rounded-xl
          ${isMobile ? 'fixed left-0 top-0 w-64' : 'lg:static lg:w-80 mr-2'} 
          ${isOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'lg:-ml-80'}
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
          {/* Close button on mobile or when auto-closing is enabled */}
          {(isMobile || canAutoClose) && (
            <button onClick={() => setIsOpen(false)} className="lg:hidden">
              <LuChevronLeft size={24} color={theme.textColor} />
            </button>
          )}
        </div>

        {/* New ChatRoom Button */}
        <button
          ref={agentSelectRef}
          className="group mt-8 mb-4 flex items-center justify-center rounded-xl bg-background bg-gradient-to-r from-primary to-primaryDark p-[2px] transition-all duration-300 hover:shadow-primaryDark"
          onClick={() => {
            setCurrentChatRoom(null);
            useChatMessageHandler.getState().messages = [];
            router.push('/dashboard/chat');
          }}
        >
          <div className="flex h-full w-full flex-row items-center justify-center gap-4 rounded-xl bg-background p-2">
            <h1 className="text-textColor">New Chat</h1>
            <VscAdd size={16} color={theme.textColor} />
          </div>
        </button>

        {/* ChatRooms List */}
        <div className="mt-[10px] flex-1 overflow-y-auto">
          <div className="flex flex-col items-start gap-y-1">
            {rooms.map((room) => {
              const isEditing = editingRoom === room.id;
              if (!room.id) return null;
              return (
                <div key={room.id} className="w-full">
                  <button
                    onClick={() => {
                      if (isMobile) setIsOpen(false);
                      setCurrentChatRoom(room);
                    }}
                    ref={(el) => {
                      if (el) editButtonRefs.current[room.id!] = el;
                      return;
                    }}
                    className={`group font-small text-sm flex w-full justify-between items-center rounded-lg p-[10px] transition-color duration-300 ease-in-out hover:bg-primaryDark
                      ${
                        pathname === `/dashboard/chat/${room.id}`
                          ? 'bg-primaryDark'
                          : ''
                      }`}
                  >
                    <h1 className="text-textColor font-normal">
                      {room.name.charAt(0).toUpperCase() + room.name.slice(1)}
                    </h1>

                    <div
                      onClick={(e) => handleEditClick(e, room.id!)}
                      className={`transition-opacity duration-300 group-hover:opacity-100 
                        ${
                          pathname === `/chat/${room.id}` ||
                          pathname.startsWith(`/chat/${room.id}/`)
                            ? 'lg:opacity-100'
                            : 'lg:opacity-0'
                        }`}
                    >
                      <LuEllipsis size={16} color={theme.textColor} />
                    </div>
                  </button>

                  {isEditing && room.id && (
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
        <div className="mt-4 w-full">
          <div
            className="flex flex-row justify-center items-center gap-5 bg-gradient-to-r from-primaryDark to-primary p-[10px] rounded-xl mb-10 shadow-primaryDark cursor-pointer truncate"
            // onClick={() => router.push('/pricing')}
          >
            <h1 className="font-semibold text-textColor">CREDITS:</h1>
            <h1 className="font-bold text-textColor text-sm">
              {'0.00'}
              {/* {credits.toFixed(2)} */}
            </h1>
          </div>
          <div className="flex flex-row items-center justify-between">
            <button
              ref={profileRef}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <LuUser size={24} color={theme.textColor} />
            </button>

            <button className="hidden sm:block">
              {!canAutoClose ? (
                <LuChevronLeft
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
                  onClick={() => {
                    setIsOpen(true);
                    setCanAutoClose(false);
                  }}
                  className="text-textColor"
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
