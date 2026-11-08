'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlphalineChannel,
  AlphalineConnectionStatus,
  AlphalineMetrics,
  AlphalineStreamItem,
  AlphalineWssConfig,
} from '@/types/alphaline';
import {
  AlphalineWssClient,
  WebSocketConstructor,
} from '@/utils/alphalineWss';

export interface UseAlphalineWssOptions extends Partial<AlphalineWssConfig> {
  autoConnect?: boolean;
  webSocketFactory?: WebSocketConstructor;
}

export interface UseAlphalineWssResult {
  status: AlphalineConnectionStatus;
  items: AlphalineStreamItem[];
  metrics: AlphalineMetrics | null;
  error: string | null;
  latencyMs: number | null;
  endpointUrl: string;
  connect: () => void;
  disconnect: () => void;
  subscribe: (channel: AlphalineChannel) => void;
  unsubscribe: (channel: AlphalineChannel) => void;
  clearItems: () => void;
}

export function useAlphalineWss(
  options: UseAlphalineWssOptions = {}
): UseAlphalineWssResult {
  const {
    autoConnect = true,
    webSocketFactory,
    url,
    channels,
    reconnect,
    maxReconnectAttempts,
    baseReconnectDelayMs,
    maxReconnectDelayMs,
    heartbeatIntervalMs,
    maxItems,
    allowInsecureLocalhost,
    apiKey,
  } = options;

  const hasExplicitChannels = Array.isArray(channels);
  const channelsKey = useMemo(
    () => (Array.isArray(channels) ? channels.join(',') : '__default__'),
    [channels]
  );

  const clientRef = useRef<AlphalineWssClient | null>(null);
  const [status, setStatus] = useState<AlphalineConnectionStatus>('idle');
  const [items, setItems] = useState<AlphalineStreamItem[]>([]);
  const [metrics, setMetrics] = useState<AlphalineMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [endpointUrl, setEndpointUrl] = useState<string>('');

  useEffect(() => {
    const resolvedChannels = hasExplicitChannels
      ? channelsKey
        ? (channelsKey.split(',') as AlphalineChannel[])
        : []
      : undefined;

    let client: AlphalineWssClient;
    try {
      client = new AlphalineWssClient(
        {
          url,
          channels: resolvedChannels,
          reconnect,
          maxReconnectAttempts,
          baseReconnectDelayMs,
          maxReconnectDelayMs,
          heartbeatIntervalMs,
          maxItems,
          allowInsecureLocalhost,
          apiKey,
        },
        webSocketFactory
      );
    } catch (err) {
      setStatus('error');
      setItems([]);
      setMetrics(null);
      setLatencyMs(null);
      setError(
        err instanceof Error ? err.message : 'Invalid Alphaline WSS configuration'
      );
      return;
    }

    clientRef.current = client;
    setStatus(client.getStatus());
    setItems(client.getItems());
    setMetrics(client.getMetrics());
    setLatencyMs(null);
    setEndpointUrl(client.getConfig().url);
    setError(null);

    const offStatus = client.onStatusChange((next) => setStatus(next));
    const offItems = client.onItemsChange((next) => setItems(next));
    const offMetrics = client.onMetricsChange((next) => setMetrics(next));
    const offError = client.onError((msg) => setError(msg));
    const offLatency = client.onLatencyChange((ms) => setLatencyMs(ms));

    if (autoConnect) {
      client.connect();
    }

    return () => {
      offStatus();
      offItems();
      offMetrics();
      offError();
      offLatency();
      client.disconnect();
      clientRef.current = null;
    };
  }, [
    autoConnect,
    webSocketFactory,
    url,
    hasExplicitChannels,
    channelsKey,
    reconnect,
    maxReconnectAttempts,
    baseReconnectDelayMs,
    maxReconnectDelayMs,
    heartbeatIntervalMs,
    maxItems,
    allowInsecureLocalhost,
    apiKey,
  ]);

  const connect = useCallback(() => {
    setError(null);
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const subscribe = useCallback((channel: AlphalineChannel) => {
    clientRef.current?.subscribe(channel);
  }, []);

  const unsubscribe = useCallback((channel: AlphalineChannel) => {
    clientRef.current?.unsubscribe(channel);
  }, []);

  const clearItems = useCallback(() => {
    clientRef.current?.clearItems();
  }, []);

  return {
    status,
    items,
    metrics,
    error,
    latencyMs,
    endpointUrl,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    clearItems,
  };
}
