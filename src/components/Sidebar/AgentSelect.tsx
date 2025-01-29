import React from 'react';
import { useAgentHandler } from '../../models/AgentHandler.ts';
import { Dropdown } from '../general/DropDown.tsx';

interface AgentSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (agentId: string) => void;
  anchorEl: null | HTMLElement;
}

export const AgentSelect: React.FC<AgentSelectProps> = ({
  isOpen,
  onClose,
  onSelect,
  anchorEl,
}) => {
  const { agents } = useAgentHandler();

  const agentList = (
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
  );

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      title="Select Agent"
      mobileTitle="Select Agent for New Chat"
      direction="down"
    >
      {agentList}
    </Dropdown>
  );
};
