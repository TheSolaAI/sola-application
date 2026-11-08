import { ALPHALINE_WSS_URL } from '../config/api_urls.ts';
import type {
  AlphalineChannel,
  AlphalineConnectionStatus,
  AlphalineMetrics,
  AlphalineParsedMessage,
  AlphalineStreamItem,
  AlphalineWssConfig,
} from '../types/alphaline.ts';

export const DEFAULT_ALPHALINE_WSS_URL = 'wss://api.alphaline.wtf/ws';

export const DEFAULT_ALPHALINE_CHANNELS: AlphalineChannel[] = [
  'bounties',
  'quests',
  'protocol_stats',
];

export interface WebSocketLike {
  readonly readyState: number;
  onopen: ((event: unknown) => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onclose: ((event: { code?: number; reason?: string }) => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export type WebSocketConstructor = new (url: string) => WebSocketLike;

const WS_OPEN = 1;

export function validateAlphalineWssUrl(
  rawUrl: string,
  allowInsecureLocalhost = false
): string {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    throw new Error('Alphaline WSS URL must be a non-empty string');
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error(`Invalid Alphaline WSS URL: ${rawUrl}`);
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol === 'wss:') {
    return parsed.toString();
  }

  const isLocalhost =
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === '[::1]';

  if (protocol === 'ws:' && allowInsecureLocalhost && isLocalhost) {
    return parsed.toString();
  }

  throw new Error(
    `Alphaline WebSocket URL must use the secure wss:// protocol (received ${parsed.protocol})`
  );
}

export function resolveAlphalineWssConfig(
  overrides: Partial<AlphalineWssConfig> = {},
  env?: Record<string, string | undefined>
): AlphalineWssConfig {
  const inlineNextUrl =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_ALPHALINE_WSS_URL
      : undefined;
  const inlineViteUrl =
    typeof process !== 'undefined' && process.env
      ? process.env.VITE_ALPHALINE_WSS_URL
      : undefined;
  const inlineNextApiKey =
    typeof process !== 'undefined' && process.env
      ? process.env.NEXT_PUBLIC_ALPHALINE_API_KEY
      : undefined;

  const envUrl = env
    ? env.NEXT_PUBLIC_ALPHALINE_WSS_URL || env.VITE_ALPHALINE_WSS_URL
    : inlineNextUrl || inlineViteUrl;
  const envApiKey = env
    ? env.NEXT_PUBLIC_ALPHALINE_API_KEY ?? inlineNextApiKey
    : inlineNextApiKey;

  const allowInsecureLocalhost = Boolean(overrides.allowInsecureLocalhost);
  const candidateUrl =
    overrides.url ||
    envUrl ||
    ALPHALINE_WSS_URL ||
    DEFAULT_ALPHALINE_WSS_URL;

  const validatedUrl = validateAlphalineWssUrl(
    candidateUrl,
    allowInsecureLocalhost
  );

  const channels =
    overrides.channels !== undefined && Array.isArray(overrides.channels)
      ? Array.from(new Set(overrides.channels.filter(Boolean)))
      : [...DEFAULT_ALPHALINE_CHANNELS];

  return {
    url: validatedUrl,
    channels,
    reconnect: overrides.reconnect ?? true,
    maxReconnectAttempts: Math.max(0, overrides.maxReconnectAttempts ?? 5),
    baseReconnectDelayMs: Math.max(100, overrides.baseReconnectDelayMs ?? 1000),
    maxReconnectDelayMs: Math.max(
      1000,
      overrides.maxReconnectDelayMs ?? 30000
    ),
    heartbeatIntervalMs: Math.max(0, overrides.heartbeatIntervalMs ?? 25000),
    maxItems: Math.max(1, overrides.maxItems ?? 50),
    allowInsecureLocalhost,
    apiKey: overrides.apiKey || envApiKey,
  };
}

export function calculateBackoffDelay(
  attempt: number,
  baseDelayMs = 1000,
  maxDelayMs = 30000
): number {
  const safeAttempt = Math.max(0, Math.floor(attempt));
  const safeBase = Math.max(50, baseDelayMs);
  const safeMax = Math.max(safeBase, maxDelayMs);
  const delay = safeBase * Math.pow(2, safeAttempt);
  return Math.min(safeMax, delay);
}

function computeStableItemId(
  channel: string,
  title: string,
  raw: Record<string, unknown>
): string {
  const fingerprint = [
    channel,
    title,
    typeof raw.protocol === 'string' ? raw.protocol : '',
    typeof raw.category === 'string' ? raw.category : '',
    typeof raw.rewardAmount === 'number'
      ? String(raw.rewardAmount)
      : typeof raw.reward === 'number'
        ? String(raw.reward)
        : typeof raw.amount === 'number'
          ? String(raw.amount)
          : '',
    typeof raw.rewardToken === 'string'
      ? raw.rewardToken
      : typeof raw.token === 'string'
        ? raw.token
        : '',
    typeof raw.walletAddress === 'string' ? raw.walletAddress : '',
    typeof raw.status === 'string' ? raw.status.toLowerCase() : '',
    typeof raw.timestamp === 'number'
      ? String(raw.timestamp)
      : typeof raw.createdAt === 'string'
        ? raw.createdAt
        : '',
    typeof raw.url === 'string' ? raw.url : '',
  ].join('|');

  let hash = 2166136261;
  for (let i = 0; i < fingerprint.length; i++) {
    hash ^= fingerprint.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `alphaline-${(hash >>> 0).toString(36)}`;
}

function normalizeStreamItem(
  raw: Record<string, unknown>,
  fallbackChannel: AlphalineChannel = 'bounties'
): AlphalineStreamItem | null {
  const title =
    typeof raw.title === 'string' && raw.title.trim()
      ? raw.title.trim()
      : typeof raw.name === 'string' && raw.name.trim()
        ? raw.name.trim()
        : '';

  if (!title) {
    return null;
  }

  const channel =
    typeof raw.channel === 'string' && raw.channel.trim()
      ? (raw.channel.trim() as AlphalineChannel)
      : fallbackChannel;

  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : computeStableItemId(channel, title, raw);

  const rewardAmount =
    typeof raw.rewardAmount === 'number'
      ? raw.rewardAmount
      : typeof raw.reward === 'number'
        ? raw.reward
        : typeof raw.amount === 'number'
          ? raw.amount
          : undefined;

  const rewardToken =
    typeof raw.rewardToken === 'string'
      ? raw.rewardToken
      : typeof raw.token === 'string'
        ? raw.token
        : undefined;

  const timestamp =
    typeof raw.timestamp === 'number' && Number.isFinite(raw.timestamp)
      ? raw.timestamp
      : typeof raw.createdAt === 'string' && !Number.isNaN(Date.parse(raw.createdAt))
        ? Date.parse(raw.createdAt)
        : Date.now();

  const statusRaw = typeof raw.status === 'string' ? raw.status.toLowerCase() : '';
  const status =
    statusRaw === 'active' ||
    statusRaw === 'completed' ||
    statusRaw === 'claimed' ||
    statusRaw === 'expired'
      ? statusRaw
      : undefined;

  return {
    id,
    channel,
    title,
    protocol: typeof raw.protocol === 'string' ? raw.protocol : undefined,
    category: typeof raw.category === 'string' ? raw.category : undefined,
    rewardAmount,
    rewardToken,
    walletAddress:
      typeof raw.walletAddress === 'string' ? raw.walletAddress : undefined,
    status,
    timestamp,
    url: typeof raw.url === 'string' ? raw.url : undefined,
  };
}

export function parseAlphalineMessage(
  rawInput: unknown
): AlphalineParsedMessage | null {
  let payload: Record<string, unknown>;

  if (typeof rawInput === 'string') {
    const trimmed = rawInput.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
      }
      payload = parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (
    rawInput &&
    typeof rawInput === 'object' &&
    !Array.isArray(rawInput)
  ) {
    payload = rawInput as Record<string, unknown>;
  } else {
    return null;
  }

  const msgType =
    typeof payload.type === 'string'
      ? payload.type.toLowerCase()
      : typeof payload.event === 'string'
        ? payload.event.toLowerCase()
        : '';

  if (msgType === 'pong' || msgType === 'heartbeat') {
    return {
      kind: 'pong',
      timestamp:
        typeof payload.timestamp === 'number' ? payload.timestamp : -1,
    };
  }

  if (msgType === 'subscribed') {
    const channels = Array.isArray(payload.channels)
      ? (payload.channels.filter(
          (c): c is string => typeof c === 'string'
        ) as AlphalineChannel[])
      : [];
    return { kind: 'subscribed', channels };
  }

  if (msgType === 'error') {
    const message =
      typeof payload.message === 'string'
        ? payload.message
        : typeof payload.error === 'string'
          ? payload.error
          : 'Alphaline WebSocket error';
    return { kind: 'error', message };
  }

  if (
    msgType === 'metrics' ||
    msgType === 'protocol_stats' ||
    (payload.metrics && typeof payload.metrics === 'object')
  ) {
    const source = (
      payload.metrics && typeof payload.metrics === 'object'
        ? payload.metrics
        : payload.data && typeof payload.data === 'object'
          ? payload.data
          : payload
    ) as Record<string, unknown>;

    const metrics: AlphalineMetrics = {
      activeCampaigns: Number(
        source.activeCampaigns ?? source.activeQuests ?? source.campaigns ?? 0
      ),
      totalVolumeUsd: Number(
        source.totalVolumeUsd ?? source.volumeUsd ?? source.volume ?? 0
      ),
      totalRewardsDistributedUsd: Number(
        source.totalRewardsDistributedUsd ??
          source.rewardsUsd ??
          source.rewards ??
          0
      ),
      activeParticipants: Number(
        source.activeParticipants ?? source.participants ?? source.users ?? 0
      ),
      updatedAt:
        typeof source.updatedAt === 'number' ? source.updatedAt : Date.now(),
    };

    return { kind: 'metrics', metrics };
  }

  const fallbackChannel =
    typeof payload.channel === 'string'
      ? (payload.channel as AlphalineChannel)
      : 'bounties';

  if (Array.isArray(payload.items) || Array.isArray(payload.data)) {
    const rawList = (
      Array.isArray(payload.items) ? payload.items : payload.data
    ) as unknown[];
    const items = rawList
      .filter(
        (entry): entry is Record<string, unknown> =>
          Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry)
      )
      .map((entry) => normalizeStreamItem(entry, fallbackChannel))
      .filter((item): item is AlphalineStreamItem => item !== null);
    if (items.length > 0) {
      return { kind: 'items', items };
    }
  }

  const candidateRecord = (
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data)
      ? payload.data
      : payload.item &&
          typeof payload.item === 'object' &&
          !Array.isArray(payload.item)
        ? payload.item
        : payload
  ) as Record<string, unknown>;

  const item = normalizeStreamItem(candidateRecord, fallbackChannel);
  if (item) {
    return { kind: 'item', item };
  }

  return null;
}

export class AlphalineWssClient {
  private config: AlphalineWssConfig;
  private wsConstructor: WebSocketConstructor | undefined;
  private socket: WebSocketLike | null = null;
  private status: AlphalineConnectionStatus = 'idle';
  private reconnectAttempts = 0;
  private manualDisconnect = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pendingPingTimestamps: number[] = [];
  private items: AlphalineStreamItem[] = [];
  private metrics: AlphalineMetrics | null = null;

  private statusListeners = new Set<(status: AlphalineConnectionStatus) => void>();
  private itemListeners = new Set<(items: AlphalineStreamItem[]) => void>();
  private metricsListeners = new Set<(metrics: AlphalineMetrics) => void>();
  private errorListeners = new Set<(error: string) => void>();
  private latencyListeners = new Set<(latencyMs: number) => void>();

  constructor(
    options: Partial<AlphalineWssConfig> = {},
    wsConstructor?: WebSocketConstructor
  ) {
    this.config = resolveAlphalineWssConfig(options);
    this.wsConstructor =
      wsConstructor ??
      (typeof globalThis !== 'undefined' &&
      typeof (globalThis as { WebSocket?: unknown }).WebSocket === 'function'
        ? ((globalThis as unknown as { WebSocket: WebSocketConstructor })
            .WebSocket)
        : undefined);
  }

  public getConfig(): AlphalineWssConfig {
    return { ...this.config, channels: [...this.config.channels] };
  }

  public getStatus(): AlphalineConnectionStatus {
    return this.status;
  }

  public getItems(): AlphalineStreamItem[] {
    return [...this.items];
  }

  public getMetrics(): AlphalineMetrics | null {
    return this.metrics ? { ...this.metrics } : null;
  }

  public connect(): void {
    if (!this.wsConstructor) {
      this.setStatus('error');
      this.emitError('WebSocket constructor is not available in this environment');
      return;
    }

    if (
      this.socket &&
      (this.status === 'connected' || this.status === 'connecting')
    ) {
      return;
    }

    if (this.socket) {
      const staleSocket = this.socket;
      this.socket = null;
      staleSocket.onopen = null;
      staleSocket.onmessage = null;
      staleSocket.onerror = null;
      staleSocket.onclose = null;
      try {
        staleSocket.close(1000, 'Reconnecting');
      } catch {
        // Ignore stale socket close errors
      }
    }

    this.manualDisconnect = false;
    this.clearTimers();
    this.pendingPingTimestamps = [];
    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      const ws = new this.wsConstructor(this.config.url);
      this.socket = ws;

      ws.onopen = () => {
        if (this.socket !== ws) return;
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.sendSubscription(this.config.channels);
        this.startHeartbeat();
      };

      ws.onmessage = (event) => {
        if (this.socket !== ws) return;
        const parsed = parseAlphalineMessage(event?.data);
        if (!parsed) return;

        if (parsed.kind === 'item') {
          this.prependItems([parsed.item]);
        } else if (parsed.kind === 'items') {
          this.prependItems(parsed.items);
        } else if (parsed.kind === 'metrics') {
          this.metrics = parsed.metrics;
          this.metricsListeners.forEach((cb) => cb(parsed.metrics));
        } else if (parsed.kind === 'pong') {
          let matchedPing: number | undefined;
          if (parsed.timestamp > 0) {
            const idx = this.pendingPingTimestamps.indexOf(parsed.timestamp);
            if (idx !== -1) {
              matchedPing = this.pendingPingTimestamps[idx];
              this.pendingPingTimestamps.splice(0, idx + 1);
            }
          }
          if (matchedPing === undefined && this.pendingPingTimestamps.length > 0) {
            matchedPing = this.pendingPingTimestamps.shift();
          }
          if (matchedPing !== undefined) {
            const rtt = Math.max(0, Date.now() - matchedPing);
            this.latencyListeners.forEach((cb) => cb(rtt));
          }
        } else if (parsed.kind === 'error') {
          this.emitError(parsed.message);
        }
      };

      ws.onerror = () => {
        if (this.socket !== ws) return;
        this.emitError('WebSocket transport error');
      };

      ws.onclose = () => {
        if (this.socket !== ws) return;
        this.stopHeartbeat();
        this.socket = null;
        if (this.manualDisconnect) {
          this.setStatus('disconnected');
          return;
        }
        this.scheduleReconnect();
      };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to open Alphaline WSS';
      this.setStatus('error');
      this.emitError(msg);
    }
  }

  public disconnect(): void {
    this.manualDisconnect = true;
    this.clearTimers();
    this.pendingPingTimestamps = [];
    if (this.socket) {
      const active = this.socket;
      this.socket = null;
      active.onopen = null;
      active.onmessage = null;
      active.onerror = null;
      active.onclose = null;
      try {
        active.close(1000, 'Client disconnected');
      } catch {
        // Ignore close errors during teardown
      }
    }
    this.setStatus('disconnected');
  }

  public subscribe(channel: AlphalineChannel): void {
    if (!channel) return;
    if (!this.config.channels.includes(channel)) {
      this.config.channels.push(channel);
    }
    if (this.socket && this.socket.readyState === WS_OPEN) {
      this.sendSubscription([channel]);
    }
  }

  public unsubscribe(channel: AlphalineChannel): void {
    this.config.channels = this.config.channels.filter((c) => c !== channel);
    if (this.socket && this.socket.readyState === WS_OPEN) {
      this.send({ type: 'unsubscribe', channels: [channel] });
    }
  }

  public clearItems(): void {
    this.items = [];
    this.itemListeners.forEach((cb) => cb([]));
  }

  public send(payload: Record<string, unknown>): boolean {
    if (!this.socket || this.socket.readyState !== WS_OPEN) {
      return false;
    }
    try {
      this.socket.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  public onStatusChange(
    listener: (status: AlphalineConnectionStatus) => void
  ): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  public onItemsChange(
    listener: (items: AlphalineStreamItem[]) => void
  ): () => void {
    this.itemListeners.add(listener);
    return () => this.itemListeners.delete(listener);
  }

  public onMetricsChange(
    listener: (metrics: AlphalineMetrics) => void
  ): () => void {
    this.metricsListeners.add(listener);
    return () => this.metricsListeners.delete(listener);
  }

  public onError(listener: (error: string) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  public onLatencyChange(listener: (latencyMs: number) => void): () => void {
    this.latencyListeners.add(listener);
    return () => this.latencyListeners.delete(listener);
  }

  private sendSubscription(channels: AlphalineChannel[]): void {
    if (channels.length === 0) return;
    this.send({
      type: 'subscribe',
      channels,
      ...(this.config.apiKey ? { apiKey: this.config.apiKey } : {}),
    });
  }

  private prependItems(incoming: AlphalineStreamItem[]): void {
    const existingByKey = new Map(
      this.items.map((item) => [`${item.channel}:${item.id}`, item])
    );
    for (const item of incoming) {
      existingByKey.set(`${item.channel}:${item.id}`, item);
    }
    this.items = Array.from(existingByKey.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, this.config.maxItems);

    const snapshot = [...this.items];
    this.itemListeners.forEach((cb) => cb(snapshot));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    if (this.config.heartbeatIntervalMs <= 0) return;

    this.heartbeatTimer = setInterval(() => {
      const pingTs = Date.now();
      this.pendingPingTimestamps.push(pingTs);
      if (this.pendingPingTimestamps.length > 32) {
        this.pendingPingTimestamps.shift();
      }
      this.send({ type: 'ping', timestamp: pingTs });
    }, this.config.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (
      !this.config.reconnect ||
      this.reconnectAttempts >= this.config.maxReconnectAttempts
    ) {
      this.setStatus('disconnected');
      return;
    }

    const delay = calculateBackoffDelay(
      this.reconnectAttempts,
      this.config.baseReconnectDelayMs,
      this.config.maxReconnectDelayMs
    );
    this.reconnectAttempts += 1;
    this.setStatus('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearTimers(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private setStatus(next: AlphalineConnectionStatus): void {
    if (this.status === next) return;
    this.status = next;
    this.statusListeners.forEach((cb) => cb(next));
  }

  private emitError(message: string): void {
    this.errorListeners.forEach((cb) => cb(message));
  }
}
