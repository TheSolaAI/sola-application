import { ChevronLeft, Edit, Menu, MessageSquare } from 'react-feather';
import React, { useState, useEffect, useRef } from 'react';
import useThemeManager from '../../models/ThemeManager.ts';
import { Button } from '@headlessui/react';
import { HoverBorderGradient } from './general/HoverBorderGradient.tsx';
import { useChat } from '../../hooks/useChatRoom.ts';
import { useRoomStore } from '../../models/RoomState.ts';
import { NavLink, useLocation } from 'react-router-dom';
import { AgentSelect } from './AgentSelect.tsx';

export const Sidebar = () => {
  /**
   * Refs
   */
  const sidebarRef = useRef<HTMLDivElement>(null);
  const agentSelectRef = useRef<HTMLButtonElement>(null);
  /**
   * models
   */
  const { theme } = useThemeManager();
  const { getRooms } = useChat();
  const { rooms, currentRoomId } = useRoomStore();
  const { pathname } = useLocation();

  /**
   * Local State
   */
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [agentSelectOpen, setAgentSelectOpen] = useState(false);

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
   * Runs at the load of the scren and sets up event listeners and loads the rooms from the server.
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
        className={`flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'} fixed bg-sec_background lg:static lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} z-40 h-full rounded-lg p-4 pt-6 lg:m-2 lg:h-[calc(100%-1rem)] shadow-black/25 shadow-[0px_0px_15px_1px]`}
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
        {/*New Chat Button*/}
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
          onSelect={(agentID) => console.log(agentID)}
        />

        {/*  Chat List*/}
        <div className="mt-[30px] flex flex-col items-start space-y-4 py-1">
          {rooms.map((room, index) => {
            const isActive = currentRoomId == room.id;
            return (
              <NavLink
                to={`/c/${room.id}`}
                className={`font-small flex w-full items-center justify-between gap-2 rounded-lg px-4 py-2 text-primary duration-300 ease-in-out ${
                  pathname === `/c/${room.id}` ||
                  pathname.startsWith(`/c/${room.id}/`)
                    ? 'bg-background'
                    : ''
                }`}
              >
                {room.name}
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};
