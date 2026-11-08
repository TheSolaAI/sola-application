import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  AlphalineWssClient,
  calculateBackoffDelay,
  DEFAULT_ALPHALINE_CHANNELS,
  DEFAULT_ALPHALINE_WSS_URL,
  parseAlphalineMessage,
  resolveAlphalineWssConfig,
  validateAlphalineWssUrl,
} from '../utils/alphalineWss.ts';
import type { WebSocketLike } from '../utils/alphalineWss.ts';

class MockWebSocket implements WebSocketLike {
  public static instances: MockWebSocket[] = [];
  public readonly url: string;
  public readyState = 0; // CONNECTING
  public sentFrames: string[] = [];
  public onopen: ((event: unknown) => void) | null = null;
  public onmessage: ((event: { data: unknown }) => void) | null = null;
  public onerror: ((event: unknown) => void) | null = null;
  public onclose: ((event: { code?: number; reason?: string }) => void) | null =
    null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  public send(data: string): void {
    this.sentFrames.push(data);
  }

  public close(code = 1000, reason = ''): void {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose({ code, reason });
    }
  }

  public triggerOpen(): void {
    this.readyState = 1; // OPEN
    if (this.onopen) {
      this.onopen({});
    }
  }

  public triggerMessage(payload: unknown): void {
    if (this.onmessage) {
      this.onmessage({
        data: typeof payload === 'string' ? payload : JSON.stringify(payload),
      });
    }
  }
}

describe('Alphaline WSS Configuration & Stream Client (#263)', () => {
  describe('validateAlphalineWssUrl', () => {
    test('accepts valid wss:// URLs', () => {
      assert.strictEqual(
        validateAlphalineWssUrl('wss://api.alphaline.wtf/ws'),
        'wss://api.alphaline.wtf/ws'
      );
    });

    test('rejects insecure ws:// or https:// URLs by default', () => {
      assert.throws(() => {
        validateAlphalineWssUrl('ws://api.alphaline.wtf/ws');
      }, /must use the secure wss:\/\/ protocol/);

      assert.throws(() => {
        validateAlphalineWssUrl('https://api.alphaline.wtf/ws');
      }, /must use the secure wss:\/\/ protocol/);
    });

    test('allows ws://localhost when allowInsecureLocalhost is enabled', () => {
      assert.strictEqual(
        validateAlphalineWssUrl('ws://localhost:8080/ws', true),
        'ws://localhost:8080/ws'
      );
    });
  });

  describe('resolveAlphalineWssConfig', () => {
    test('uses default endpoint and channels when no overrides are given', () => {
      const cfg = resolveAlphalineWssConfig({}, {});
      assert.strictEqual(cfg.url, DEFAULT_ALPHALINE_WSS_URL);
      assert.deepStrictEqual(cfg.channels, DEFAULT_ALPHALINE_CHANNELS);
      assert.strictEqual(cfg.reconnect, true);
    });

    test('prioritizes explicit overrides over environment variables and preserves empty channels array', () => {
      const cfg = resolveAlphalineWssConfig(
        {
          url: 'wss://custom.alphaline.wtf/stream',
          channels: ['bounties', 'leaderboard'],
        },
        {
          NEXT_PUBLIC_ALPHALINE_WSS_URL: 'wss://env.alphaline.wtf/ws',
        }
      );
      assert.strictEqual(cfg.url, 'wss://custom.alphaline.wtf/stream');
      assert.deepStrictEqual(cfg.channels, ['bounties', 'leaderboard']);

      const emptyChannelsCfg = resolveAlphalineWssConfig({ channels: [] }, {});
      assert.deepStrictEqual(emptyChannelsCfg.channels, []);
    });

    test('reads NEXT_PUBLIC_ALPHALINE_WSS_URL and VITE_ALPHALINE_WSS_URL from env', () => {
      const fromNext = resolveAlphalineWssConfig(
        {},
        { NEXT_PUBLIC_ALPHALINE_WSS_URL: 'wss://next.alphaline.wtf/ws' }
      );
      assert.strictEqual(fromNext.url, 'wss://next.alphaline.wtf/ws');

      const fromVite = resolveAlphalineWssConfig(
        {},
        { VITE_ALPHALINE_WSS_URL: 'wss://vite.alphaline.wtf/ws' }
      );
      assert.strictEqual(fromVite.url, 'wss://vite.alphaline.wtf/ws');
    });
  });

  describe('calculateBackoffDelay', () => {
    test('computes exponential backoff and caps at maxDelayMs', () => {
      assert.strictEqual(calculateBackoffDelay(0, 1000, 10000), 1000);
      assert.strictEqual(calculateBackoffDelay(1, 1000, 10000), 2000);
      assert.strictEqual(calculateBackoffDelay(2, 1000, 10000), 4000);
      assert.strictEqual(calculateBackoffDelay(3, 1000, 10000), 8000);
      assert.strictEqual(calculateBackoffDelay(4, 1000, 10000), 10000);
    });
  });

  describe('parseAlphalineMessage', () => {
    test('parses single stream event items and normalizes fields', () => {
      const res = parseAlphalineMessage(
        JSON.stringify({
          type: 'event',
          channel: 'bounties',
          data: {
            id: 'bounty-1',
            title: 'Swap 50 USDC on Jupiter',
            protocol: 'Jupiter',
            rewardAmount: 25,
            rewardToken: 'USDC',
            status: 'active',
            timestamp: 1710000000000,
          },
        })
      );

      assert.ok(res);
      assert.strictEqual(res.kind, 'item');
      assert.strictEqual(res.item.id, 'bounty-1');
      assert.strictEqual(res.item.title, 'Swap 50 USDC on Jupiter');
      assert.strictEqual(res.item.protocol, 'Jupiter');
      assert.strictEqual(res.item.rewardAmount, 25);
      assert.strictEqual(res.item.rewardToken, 'USDC');
    });

    test('computes deterministic fallback id when payload omits id', () => {
      const payload = {
        type: 'event',
        channel: 'bounties',
        data: {
          title: 'Stake 10 SOL on Jito',
          protocol: 'Jito',
          timestamp: 1710000099000,
        },
      };
      const first = parseAlphalineMessage(payload);
      const second = parseAlphalineMessage(payload);
      assert.ok(first && first.kind === 'item');
      assert.ok(second && second.kind === 'item');
      assert.strictEqual(first.item.id, second.item.id);
    });

    test('parses protocol metrics frames', () => {
      const res = parseAlphalineMessage({
        type: 'metrics',
        metrics: {
          activeCampaigns: 14,
          totalVolumeUsd: 1250000,
          totalRewardsDistributedUsd: 48000,
          activeParticipants: 3920,
          updatedAt: 1710000005000,
        },
      });

      assert.ok(res);
      assert.strictEqual(res.kind, 'metrics');
      assert.strictEqual(res.metrics.activeCampaigns, 14);
      assert.strictEqual(res.metrics.totalVolumeUsd, 1250000);
      assert.strictEqual(res.metrics.totalRewardsDistributedUsd, 48000);
      assert.strictEqual(res.metrics.activeParticipants, 3920);
    });

    test('returns null on malformed JSON or unrelated empty objects', () => {
      assert.strictEqual(parseAlphalineMessage('{invalid json'), null);
      assert.strictEqual(parseAlphalineMessage(''), null);
      assert.strictEqual(parseAlphalineMessage({ foo: 'bar' }), null);
    });
  });

  describe('AlphalineWssClient lifecycle', () => {
    test('connects, sends subscription frame, processes items/metrics, and disconnects cleanly', () => {
      MockWebSocket.instances = [];
      const statuses: string[] = [];
      let latestItemsCount = 0;
      let latestCampaigns = 0;

      const client = new AlphalineWssClient(
        {
          url: 'wss://api.alphaline.wtf/ws',
          channels: ['bounties', 'quests'],
          heartbeatIntervalMs: 0,
          reconnect: false,
        },
        MockWebSocket
      );

      client.onStatusChange((s) => statuses.push(s));
      client.onItemsChange((items) => {
        latestItemsCount = items.length;
      });
      client.onMetricsChange((m) => {
        latestCampaigns = m.activeCampaigns;
      });

      client.connect();
      assert.strictEqual(MockWebSocket.instances.length, 1);
      const ws = MockWebSocket.instances[0];

      ws.triggerOpen();
      assert.strictEqual(client.getStatus(), 'connected');
      assert.strictEqual(ws.sentFrames.length, 1);
      assert.deepStrictEqual(JSON.parse(ws.sentFrames[0]), {
        type: 'subscribe',
        channels: ['bounties', 'quests'],
      });

      ws.triggerMessage({
        type: 'event',
        channel: 'quests',
        data: {
          id: 'q-101',
          title: 'Deposit SOL on Marginfi',
          protocol: 'Marginfi',
          rewardAmount: 10,
          rewardToken: 'SOL',
          timestamp: 1710000010000,
        },
      });
      assert.strictEqual(latestItemsCount, 1);
      assert.strictEqual(client.getItems()[0].title, 'Deposit SOL on Marginfi');

      // Same id on a different channel should NOT overwrite the existing item
      ws.triggerMessage({
        type: 'event',
        channel: 'bounties',
        data: {
          id: 'q-101',
          title: 'Bounty with same numeric ID',
          protocol: 'Kamino',
          rewardAmount: 20,
          rewardToken: 'USDC',
          timestamp: 1710000020000,
        },
      });
      assert.strictEqual(latestItemsCount, 2);

      ws.triggerMessage({
        type: 'metrics',
        data: {
          activeCampaigns: 9,
          totalVolumeUsd: 500000,
          totalRewardsDistributedUsd: 12000,
          activeParticipants: 850,
        },
      });
      assert.strictEqual(latestCampaigns, 9);

      client.disconnect();
      assert.strictEqual(client.getStatus(), 'disconnected');
      assert.deepStrictEqual(statuses, ['connecting', 'connected', 'disconnected']);
    });
  });
});
