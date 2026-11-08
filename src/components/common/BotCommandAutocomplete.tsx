'use client';
import React, { FC, useEffect, useState } from 'react';
import {
  BotCommand,
  findMatchingCommands,
  formatCommandDisplay,
} from '@/utils/botCommands';

interface BotCommandAutocompleteProps {
  inputValue: string;
  isOpen: boolean;
  onSelectCommand: (command: BotCommand, autoSend?: boolean) => void;
  onClose: () => void;
  onOpenCreateModal?: () => void;
}

export const BotCommandAutocomplete: FC<BotCommandAutocompleteProps> = ({
  inputValue,
  isOpen,
  onSelectCommand,
  onClose,
  onOpenCreateModal,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // If input starts with '/', search query is everything after the slash
  const query = inputValue.startsWith('/') ? inputValue.slice(1) : '';
  const matchingCommands = findMatchingCommands(query);

  useEffect(() => {
    setSelectedIndex(0);
  }, [inputValue]);

  if (!isOpen || matchingCommands.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-3 bg-[#111116] border border-[#262633] rounded-2xl shadow-2xl overflow-hidden z-30 max-h-72 flex flex-col backdrop-blur-xl"
      style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(99, 102, 241, 0.1)',
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181822] border-b border-[#262633] text-xs text-gray-400">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-300">
          Bot Commands ({matchingCommands.length})
        </span>
        {onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
          >
            <span>+ New Command</span>
          </button>
        )}
      </div>

      {/* Commands List */}
      <div className="overflow-y-auto divide-y divide-[#1e1e28]">
        {matchingCommands.map((command, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={command.id}
              onClick={() => onSelectCommand(command, false)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                isSelected ? 'bg-[#20202d]' : 'hover:bg-[#1a1a24]'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-blue-400">
                    {formatCommandDisplay(command.name)}
                  </span>
                  {command.isDefault && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2b2b3d] text-gray-400">
                      built-in
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-300 truncate mt-0.5">
                  {command.description}
                </span>
                <span className="text-[11px] text-gray-500 italic truncate mt-0.5 font-mono">
                  &quot;{command.prompt}&quot;
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCommand(command, true);
                  }}
                  className="px-2 py-1 text-[11px] rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  Run
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
