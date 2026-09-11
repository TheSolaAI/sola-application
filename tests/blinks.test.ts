process.env.AUTH_SERVICE_URL = 'https://auth.sola.ai';
process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = 'https://auth.sola.ai';
process.env.NEXT_PUBLIC_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
process.env.NEXT_PUBLIC_DATA_SERVICE_URL = 'https://data.sola.ai';
process.env.NEXT_PUBLIC_WALLET_SERVICE_URL = 'https://wallet.sola.ai';

import { describe, it, expect } from 'bun:test';
import { createBlinksTool } from '../src/tools/commonToolSet/blinks';
import { ToolContext } from '../src/types/tool';

describe('Blinks AI Config Tool & Handsfree Execution', () => {
  const mockContext: ToolContext = {
    agentId: 'test-agent',
    userId: 'test-user',
    conversationId: 'test-convo',
  } as any;

  const blinksTool = createBlinksTool(mockContext);

  it('should initialize blinks tool with proper description and parameters', () => {
    expect(blinksTool.description).toContain('Solana Blinks');
    expect(blinksTool.parameters).toBeDefined();
  });

  it('should resolve predefined coinflip game preset handsfree', async () => {
    const result = await blinksTool.execute({
      game: 'coinflip',
      autoTrigger: true,
      choice: 'heads',
      amount: 0.1,
    } as any, { toolCallId: 'test-call', messages: [] });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.game).toBe('coinflip');
    expect(result.data.title).toContain('Coin Flip');
    expect(result.data.actionUrl).toContain('actions.dialect.to/api/games/coinflip');
    expect(result.data.autoTrigger).toBe(true);
    expect(result.data.params.choice).toBe('heads');
    expect(result.data.params.amount).toBe(0.1);
  });

  it('should resolve rockpaperscissors game preset handsfree', async () => {
    const result = await blinksTool.execute({
      game: 'rockpaperscissors',
      autoTrigger: true,
      choice: 'rock',
    } as any, { toolCallId: 'test-call-2', messages: [] });

    expect(result.success).toBe(true);
    expect(result.data.game).toBe('rockpaperscissors');
    expect(result.data.title).toContain('Rock Paper Scissors');
    expect(result.data.actionUrl).toContain('actions.dialect.to/api/games/rps');
  });

  it('should support custom Solana Action Blink URLs', async () => {
    const customUrl = 'https://custom-blink-dapp.solana/api/action';
    const result = await blinksTool.execute({
      actionUrl: customUrl,
      autoTrigger: true,
    } as any, { toolCallId: 'test-call-3', messages: [] });

    expect(result.success).toBe(true);
    expect(result.data.actionUrl).toBe(customUrl);
    expect(result.data.autoTrigger).toBe(true);
    expect(result.data.game).toBe('custom');
  });

  it('should gracefully return error if neither game preset nor actionUrl is provided', async () => {
    const result = await blinksTool.execute({} as any, { toolCallId: 'test-call-4', messages: [] });

    expect(result.success).toBe(false);
    expect(result.error).toContain('valid game identifier or actionUrl');
  });

  it('should verify transaction confirmation successfully when mined', async () => {
    const { waitForTransactionConfirmation } = await import('../src/hooks/useBlinkAction');

    // Mock global fetch for getTransaction
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: any, init?: any) => {
      if (typeof input === 'string' && input.includes('/api/wallet/getTransaction')) {
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            transaction: {
              slot: 123456,
              meta: { err: null },
            },
          }),
        } as any;
      }
      return originalFetch(input, init);
    };

    try {
      const confirmed = await waitForTransactionConfirmation('test-sig-1', 3, 10);
      expect(confirmed).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should throw error when transaction execution failed on-chain', async () => {
    const { waitForTransactionConfirmation } = await import('../src/hooks/useBlinkAction');

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: any, init?: any) => {
      if (typeof input === 'string' && input.includes('/api/wallet/getTransaction')) {
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            transaction: {
              slot: 123456,
              meta: { err: { InstructionError: [0, 'Custom(1)'] } },
            },
            error: true,
          }),
        } as any;
      }
      return originalFetch(input, init);
    };

    try {
      let threw = false;
      try {
        await waitForTransactionConfirmation('test-sig-failed', 3, 10);
      } catch (err: any) {
        threw = true;
        expect(err.message).toContain('InstructionError');
      }
      expect(threw).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should throw timeout error when transaction is never confirmed or dropped', async () => {
    const { waitForTransactionConfirmation } = await import('../src/hooks/useBlinkAction');

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: any, init?: any) => {
      if (typeof input === 'string' && input.includes('/api/wallet/getTransaction')) {
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            transaction: null,
          }),
        } as any;
      }
      return originalFetch(input, init);
    };

    try {
      let threw = false;
      try {
        await waitForTransactionConfirmation('test-sig-pending', 2, 5);
      } catch (err: any) {
        threw = true;
        expect(err.message).toContain('timed out');
      }
      expect(threw).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
