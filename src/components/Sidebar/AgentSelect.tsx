import React from 'react';
import { useAgentHandler } from '../../models/AgentHandler.ts';
import { Dropdown } from '../general/DropDown.tsx';

interface AgentSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (agentId: number) => void;
  anchorEl: null | HTMLElement;
}

export const AgentSelect: React.FC<AgentSelectProps> = ({
  isOpen,
  onClose,
  onSelect,
  anchorEl,
}) => {
  const { agents } = useAgentHandler();

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      title="Select Agent"
      mobileTitle="Select Agent for New Chat"
      direction="down"
    >
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
            <agent.logo className="w-8 h-8 rounded-lg transition-all outline-none group-hover:outline group-hover:outline-primaryDark group-hover:outline-[3px]" />

            <div className="flex flex-col items-start">
              <h1 className="text-xl font-medium text-left">{agent.name}</h1>
              <h3 className="text-sm font-light text-left">
                {agent.description}
              </h3>
            </div>
          </button>
        ))}
      </div>
    </Dropdown>
  );
};
