import React, { useEffect, useRef, useState } from 'react';
import { useAgentHandler } from '../../models/AgentHandler.ts';
import { motion } from 'framer-motion';

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
  const { agents } = useAgentHandler();
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

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
  }, [isOpen, anchorEl]);

  /**
   * Closes the popup when clicking outside of it.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed z-50 rounded-xl border-border border-[0.5px] bg-background  p-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
    >
      <h1 className=" text-xl font-bold text-textColor p-2">Select Agent</h1>

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
