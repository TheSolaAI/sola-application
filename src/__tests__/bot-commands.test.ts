import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BOT_COMMANDS,
  deleteCustomBotCommand,
  expandBotCommand,
  findMatchingCommands,
  formatCommandDisplay,
  getBotCommands,
  normalizeCommandName,
  parseBotCommand,
  resetBotCommandsToDefault,
  saveCustomBotCommand,
  STORAGE_KEY_BOT_COMMANDS,
} from '../utils/botCommands.ts';

// Mock localStorage for Node.js test environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('Telegram-style Bot Commands (#398)', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    const mockStorage = new MockLocalStorage();
    (globalThis as any).window = {
      localStorage: mockStorage,
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  describe('normalizeCommandName and formatCommandDisplay', () => {
    test('normalizes command names by removing slashes and trimming', () => {
      assert.strictEqual(normalizeCommandName('/update-me'), 'update-me');
      assert.strictEqual(normalizeCommandName('///PRICE '), 'price');
      assert.strictEqual(normalizeCommandName('  portfolio  '), 'portfolio');
    });

    test('formats command display with leading slash', () => {
      assert.strictEqual(formatCommandDisplay('update-me'), '/update-me');
      assert.strictEqual(formatCommandDisplay('/trending'), '/trending');
    });
  });

  describe('parseBotCommand', () => {
    test('identifies non-command input as not a command', () => {
      const parsed = parseBotCommand('Hello AI, how are you?');
      assert.strictEqual(parsed.isCommand, false);
      assert.strictEqual(parsed.commandName, '');
      assert.strictEqual(parsed.args, '');
    });

    test('parses simple command without arguments', () => {
      const parsed = parseBotCommand('/update-me');
      assert.strictEqual(parsed.isCommand, true);
      assert.strictEqual(parsed.commandName, 'update-me');
      assert.strictEqual(parsed.args, '');
    });

    test('parses command with trailing arguments', () => {
      const parsed = parseBotCommand('/price SOL');
      assert.strictEqual(parsed.isCommand, true);
      assert.strictEqual(parsed.commandName, 'price');
      assert.strictEqual(parsed.args, 'SOL');
    });

    test('parses command with multiple space-separated arguments', () => {
      const parsed = parseBotCommand('/swap 10 SOL to USDC');
      assert.strictEqual(parsed.isCommand, true);
      assert.strictEqual(parsed.commandName, 'swap');
      assert.strictEqual(parsed.args, '10 SOL to USDC');
    });
  });

  describe('expandBotCommand', () => {
    test('expands built-in /update-me command', () => {
      const result = expandBotCommand('/update-me');
      assert.strictEqual(result.expanded, true);
      assert.strictEqual(result.commandName, 'update-me');
      assert.ok(result.prompt.includes('price of SOL'));
    });

    test('expands /price with custom argument replacing {args}', () => {
      const result = expandBotCommand('/price BONK');
      assert.strictEqual(result.expanded, true);
      assert.strictEqual(result.commandName, 'price');
      assert.ok(result.prompt.includes('BONK'));
      assert.ok(!result.prompt.includes('{args}'));
    });

    test('returns original input when command is not found', () => {
      const result = expandBotCommand('/nonexistent-cmd');
      assert.strictEqual(result.expanded, false);
      assert.strictEqual(result.prompt, '/nonexistent-cmd');
    });

    test('returns original input for regular text', () => {
      const result = expandBotCommand('what is bitcoin?');
      assert.strictEqual(result.expanded, false);
      assert.strictEqual(result.prompt, 'what is bitcoin?');
    });
  });

  describe('Custom Command Storage (Save, Get, Delete, Reset)', () => {
    test('returns default commands initially', () => {
      const commands = getBotCommands();
      assert.strictEqual(commands.length, DEFAULT_BOT_COMMANDS.length);
      assert.ok(commands.some((c) => c.name === 'update-me'));
    });

    test('saves a new custom command and retrieves it', () => {
      const saved = saveCustomBotCommand({
        name: 'my-stats',
        description: 'Get my trading statistics',
        prompt: 'Show my 30-day trading metrics, PnL, and win rate.',
      });

      assert.strictEqual(saved.name, 'my-stats');
      assert.strictEqual(saved.isDefault, false);

      const all = getBotCommands();
      const found = all.find((c) => c.name === 'my-stats');
      assert.ok(found);
      assert.strictEqual(found?.prompt, 'Show my 30-day trading metrics, PnL, and win rate.');

      // Expands custom command
      const expanded = expandBotCommand('/my-stats');
      assert.strictEqual(expanded.expanded, true);
      assert.strictEqual(expanded.prompt, 'Show my 30-day trading metrics, PnL, and win rate.');
    });

    test('rejects empty command names or prompts', () => {
      assert.throws(() => {
        saveCustomBotCommand({ name: '', description: '', prompt: 'valid prompt' });
      }, /Command name cannot be empty/);

      assert.throws(() => {
        saveCustomBotCommand({ name: 'valid-name', description: '', prompt: '' });
      }, /Command prompt expansion cannot be empty/);
    });

    test('deletes a custom command successfully', () => {
      saveCustomBotCommand({
        name: 'temporary-cmd',
        description: 'Temporary',
        prompt: 'Do something temp',
      });

      const deleted = deleteCustomBotCommand('temporary-cmd');
      assert.strictEqual(deleted, true);

      const all = getBotCommands();
      assert.strictEqual(all.some((c) => c.name === 'temporary-cmd'), false);
    });

    test('resets commands back to defaults', () => {
      saveCustomBotCommand({
        name: 'cmd-to-reset',
        description: 'Testing',
        prompt: 'Prompt',
      });

      resetBotCommandsToDefault();
      const all = getBotCommands();
      assert.strictEqual(all.length, DEFAULT_BOT_COMMANDS.length);
      assert.strictEqual(all.some((c) => c.name === 'cmd-to-reset'), false);
    });
  });

  describe('findMatchingCommands', () => {
    test('matches commands based on prefix', () => {
      const matches = findMatchingCommands('/up');
      assert.ok(matches.length >= 1);
      assert.strictEqual(matches[0].name, 'update-me');
    });

    test('returns all commands when query is empty or slash only', () => {
      assert.strictEqual(findMatchingCommands('').length, DEFAULT_BOT_COMMANDS.length);
      assert.strictEqual(findMatchingCommands('/').length, DEFAULT_BOT_COMMANDS.length);
    });

    test('matches commands by keyword in description', () => {
      const matches = findMatchingCommands('portfolio');
      assert.ok(matches.some((c) => c.name === 'portfolio'));
    });
  });
});
