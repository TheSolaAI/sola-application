/**
 * Telegram-style custom bot command utilities and storage management (#398)
 */

export interface BotCommand {
  id: string;
  name: string; // e.g. "update-me", "price" (without leading slash)
  description: string;
  prompt: string; // the expanded prompt template sent to the AI
  isDefault?: boolean;
  createdAt?: number;
}

export const STORAGE_KEY_BOT_COMMANDS = 'sola_custom_bot_commands';

export const DEFAULT_BOT_COMMANDS: BotCommand[] = [
  {
    id: 'cmd-update-me',
    name: 'update-me',
    description: 'Get current price of SOL and market overview',
    prompt:
      'Give me a comprehensive update: current price of SOL, 24h market trends, and crypto overview.',
    isDefault: true,
  },
  {
    id: 'cmd-price',
    name: 'price',
    description: 'Check real-time price of a token (e.g. /price SOL)',
    prompt:
      'What is the current real-time price and 24h price change of {args}?',
    isDefault: true,
  },
  {
    id: 'cmd-portfolio',
    name: 'portfolio',
    description: 'Check my connected wallet token balances and value',
    prompt:
      'Check my connected wallet balances and summarize my token portfolio.',
    isDefault: true,
  },
  {
    id: 'cmd-trending',
    name: 'trending',
    description: 'List top trending tokens and gainers on Solana',
    prompt:
      'What are the top trending tokens and volume gainers on Solana right now?',
    isDefault: true,
  },
  {
    id: 'cmd-help',
    name: 'help',
    description: 'List available bot commands and capabilities',
    prompt:
      'List the available bot commands, wallet tools, and actions you can perform for me.',
    isDefault: true,
  },
];

/**
 * Normalizes command name by removing leading slash, trimming whitespace, and converting to lowercase.
 */
export function normalizeCommandName(name: string): string {
  return name.trim().replace(/^\/+/, '').toLowerCase();
}

/**
 * Ensures command name has a leading slash for display purposes.
 */
export function formatCommandDisplay(name: string): string {
  const normalized = normalizeCommandName(name);
  return `/${normalized}`;
}

export interface ParsedCommand {
  isCommand: boolean;
  commandName: string;
  args: string;
  rawInput: string;
}

/**
 * Parses user input to check if it represents a bot command (e.g., "/update-me" or "/price SOL").
 */
export function parseBotCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) {
    return {
      isCommand: false,
      commandName: '',
      args: '',
      rawInput: input,
    };
  }

  const spaceIndex = trimmed.indexOf(' ');
  let commandPart = trimmed;
  let args = '';

  if (spaceIndex !== -1) {
    commandPart = trimmed.slice(0, spaceIndex);
    args = trimmed.slice(spaceIndex + 1).trim();
  }

  const commandName = normalizeCommandName(commandPart);

  return {
    isCommand: commandName.length > 0,
    commandName,
    args,
    rawInput: input,
  };
}

/**
 * Retrieves all bot commands (combining default commands with user-saved custom commands).
 */
export function getBotCommands(): BotCommand[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [...DEFAULT_BOT_COMMANDS];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BOT_COMMANDS);
    if (!raw) {
      return [...DEFAULT_BOT_COMMANDS];
    }
    const custom: BotCommand[] = JSON.parse(raw);
    if (!Array.isArray(custom)) {
      return [...DEFAULT_BOT_COMMANDS];
    }

    // Merge default commands with custom commands (custom can override defaults)
    const customNames = new Set(custom.map((c) => normalizeCommandName(c.name)));
    const filteredDefaults = DEFAULT_BOT_COMMANDS.filter(
      (d) => !customNames.has(normalizeCommandName(d.name))
    );

    return [...custom, ...filteredDefaults];
  } catch (error) {
    console.warn('[BotCommands] Error reading from localStorage:', error);
    return [...DEFAULT_BOT_COMMANDS];
  }
}

/**
 * Saves a new or updated custom bot command to localStorage.
 */
export function saveCustomBotCommand(command: {
  id?: string;
  name: string;
  description: string;
  prompt: string;
}): BotCommand {
  const normalizedName = normalizeCommandName(command.name);
  if (!normalizedName) {
    throw new Error('Command name cannot be empty');
  }
  if (!command.prompt.trim()) {
    throw new Error('Command prompt expansion cannot be empty');
  }

  const existingCommands = getBotCommands();
  const id = command.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const newCommand: BotCommand = {
    id,
    name: normalizedName,
    description: command.description.trim() || `Custom command /${normalizedName}`,
    prompt: command.prompt.trim(),
    isDefault: false,
    createdAt: Date.now(),
  };

  // Replace if name or id already exists in custom list
  const customList = existingCommands
    .filter((c) => !c.isDefault)
    .filter((c) => c.id !== id && normalizeCommandName(c.name) !== normalizedName);

  customList.unshift(newCommand);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_BOT_COMMANDS, JSON.stringify(customList));
    } catch (e) {
      console.warn('[BotCommands] Error saving to localStorage:', e);
    }
  }

  return newCommand;
}

/**
 * Deletes a custom bot command by ID or name.
 */
export function deleteCustomBotCommand(idOrName: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  const normalized = normalizeCommandName(idOrName);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BOT_COMMANDS);
    if (!raw) return false;
    const custom: BotCommand[] = JSON.parse(raw);
    const updated = custom.filter(
      (c) => c.id !== idOrName && normalizeCommandName(c.name) !== normalized
    );

    window.localStorage.setItem(STORAGE_KEY_BOT_COMMANDS, JSON.stringify(updated));
    return updated.length < custom.length;
  } catch (e) {
    console.warn('[BotCommands] Error deleting from localStorage:', e);
    return false;
  }
}

/**
 * Resets all bot commands to the system defaults.
 */
export function resetBotCommandsToDefault(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY_BOT_COMMANDS);
    } catch (e) {
      console.warn('[BotCommands] Error resetting commands:', e);
    }
  }
}

/**
 * Finds matching commands for autocomplete suggestion popup based on user query.
 */
export function findMatchingCommands(query: string, commandList?: BotCommand[]): BotCommand[] {
  const commands = commandList || getBotCommands();
  const normalizedQuery = normalizeCommandName(query);

  if (!normalizedQuery) {
    return commands;
  }

  return commands.filter((cmd) => {
    const cmdName = normalizeCommandName(cmd.name);
    return (
      cmdName.includes(normalizedQuery) ||
      cmd.description.toLowerCase().includes(normalizedQuery)
    );
  });
}

export interface ExpandedCommandResult {
  expanded: boolean;
  prompt: string;
  command?: BotCommand;
  commandName?: string;
  args?: string;
}

/**
 * Expands a command string into its full prompt.
 * If input is "/update-me", expands to command prompt.
 * If input has arguments like "/price SOL", replaces "{args}" or appends arguments.
 */
export function expandBotCommand(
  input: string,
  commandList?: BotCommand[]
): ExpandedCommandResult {
  const parsed = parseBotCommand(input);
  if (!parsed.isCommand) {
    return {
      expanded: false,
      prompt: input,
    };
  }

  const commands = commandList || getBotCommands();
  const matchedCommand = commands.find(
    (c) => normalizeCommandName(c.name) === parsed.commandName
  );

  if (!matchedCommand) {
    return {
      expanded: false,
      prompt: input,
      commandName: parsed.commandName,
      args: parsed.args,
    };
  }

  let expandedPrompt = matchedCommand.prompt;

  if (expandedPrompt.includes('{args}')) {
    const effectiveArgs = parsed.args || 'SOL';
    expandedPrompt = expandedPrompt.replace(/\{args\}/g, effectiveArgs);
  } else if (parsed.args) {
    expandedPrompt = `${expandedPrompt} Context: ${parsed.args}`;
  }

  return {
    expanded: true,
    prompt: expandedPrompt,
    command: matchedCommand,
    commandName: parsed.commandName,
    args: parsed.args,
  };
}
