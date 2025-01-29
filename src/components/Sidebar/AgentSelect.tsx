import React, { useEffect, useRef, useState } from 'react';
import { useAgentHandler } from '../../models/AgentHandler.ts';
import { AnimatePresence, motion } from 'framer-motion';

interface AgentSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (agentId: string) => void;
  anchorEl: null | HTMLElement; // The element that the popover should be anchored to
}

export const AgentSelect: React.FC<AgentSelectProps> = ({
  onSelect,
  anchorEl,
  onClose,
  isOpen,
}) => {
  /**
   * Refs
   */
  const popupRef = useRef<HTMLDivElement>(null);

  /**
   * Models
   */
  const { agents } = useAgentHandler();

  /**
   * Local State
   */
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Sets the position of the popup when it is opened to the anchor element.
   */
  useEffect(() => {
    if (isOpen && anchorEl && popupRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      setPosition({
        top: anchorRect.bottom + window.scrollY + 10,
        left: anchorRect.left + window.scrollX - 5,
        width: anchorRect.width,
      });
    }
  }, [isOpen, anchorEl, isMobile]);

  /**
   * If we are in mobile view then we render a bottom card instead of the dropdown menu
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Closes the popup when clicking outside of it.
   */
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        anchorEl &&
        !anchorEl.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          ref={popupRef}
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-border bg-background p-4 max-h-[80vh] overflow-y-auto w-screen"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

          <h1 className="text-xl font-bold text-textColor px-2 mb-4">
            Select Agent for New Chat
          </h1>

          <div className="space-y-5">
            {agents.map((agent) => (
              <button
                key={agent.agentID}
                className="group flex w-full items-start gap-3 rounded-lg text-textColor transition-all hover:bg-surface p-2"
                onClick={() => {
                  onSelect(agent.agentID);
                  onClose();
                }}
              >
                <img
                  src={agent.logo}
                  alt={agent.name}
                  className="w-8 h-8 rounded-full transition-all outline-none group-hover:outline group-hover:outline-primaryDark group-hover:outline-[3px]"
                />

                <div className="flex flex-col items-start">
                  <h1 className="text-xl font-medium text-left">
                    {agent.name}
                  </h1>
                  <h3 className="text-sm font-light text-left">
                    {agent.description}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed z-50 rounded-xl border-border border-[0.5px] bg-background p-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
    >
      <h1 className="text-xl font-bold text-textColor p-2">Select Agent</h1>

      <div className="space-y-5 my-3">
        {agents.map((agent) => (
          <button
            key={agent.agentID}
            className="group flex w-full items-start gap-3 rounded-lg text-textColor transition-all hover:bg-surface p-2"
            onClick={() => {
              onSelect(agent.agentID);
              onClose();
            }}
          >
            <img
              src={agent.logo}
              alt={agent.name}
              className="w-8 h-8 rounded-full transition-all outline-none group-hover:outline group-hover:outline-primaryDark group-hover:outline-[3px]"
            />

            <div className="flex flex-col items-start">
              <h1 className="text-xl font-medium text-left">{agent.name}</h1>
              <h3 className="text-sm font-light text-left">
                {agent.description}
              </h3>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
