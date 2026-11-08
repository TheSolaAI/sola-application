'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  BotCommand,
  deleteCustomBotCommand,
  getBotCommands,
  resetBotCommandsToDefault,
  saveCustomBotCommand,
} from '@/utils/botCommands';

export function useBotCommands() {
  const [commands, setCommands] = useState<BotCommand[]>([]);

  const refreshCommands = useCallback(() => {
    setCommands(getBotCommands());
  }, []);

  useEffect(() => {
    refreshCommands();

    // Listen to storage events to keep tabs in sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sola_custom_bot_commands') {
        refreshCommands();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshCommands]);

  const saveCommand = useCallback(
    (command: { id?: string; name: string; description: string; prompt: string }) => {
      const saved = saveCustomBotCommand(command);
      refreshCommands();
      return saved;
    },
    [refreshCommands]
  );

  const deleteCommand = useCallback(
    (idOrName: string) => {
      const success = deleteCustomBotCommand(idOrName);
      refreshCommands();
      return success;
    },
    [refreshCommands]
  );

  const resetDefaults = useCallback(() => {
    resetBotCommandsToDefault();
    refreshCommands();
  }, [refreshCommands]);

  return {
    commands,
    saveCommand,
    deleteCommand,
    resetDefaults,
    refreshCommands,
  };
}
