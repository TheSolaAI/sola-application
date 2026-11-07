'use client';

import { useEffect, useCallback } from 'react';
import { APP_VERSION, isVersionOutdated } from '@/utils/version';

const VERSION_STORAGE_KEY = 'sola_app_version';

export interface VersionCacheControlOptions {
  checkIntervalMs?: number;
  autoReloadOnUpdate?: boolean;
}

/**
 * Hook to manage client-side version validation, stale cache clearing,
 * and service worker synchronization.
 */
export function useVersionCacheControl(
  options: VersionCacheControlOptions = {}
) {
  const { checkIntervalMs = 15 * 60 * 1000, autoReloadOnUpdate = false } = options;

  const purgeBrowserCaches = useCallback(async () => {
    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys.map((key) => {
            console.log('[CacheControl] Deleting browser cache key:', key);
            return caches.delete(key);
          })
        );
      }
    } catch (err) {
      console.warn('[CacheControl] Failed to purge caches:', err);
    }
  }, []);

  const notifyServiceWorker = useCallback((type: 'SKIP_WAITING' | 'CLEAR_CACHE') => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type });
    }
  }, []);

  const checkVersion = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const response = await fetch('/api/version', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) return;

      const data = await response.json();
      const serverVersion = data.version;
      const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

      if (isVersionOutdated(storedVersion, serverVersion)) {
        console.log(
          `[CacheControl] Version update detected: ${storedVersion} -> ${serverVersion}`
        );

        // Purge old cache storage
        await purgeBrowserCaches();
        notifyServiceWorker('CLEAR_CACHE');
        notifyServiceWorker('SKIP_WAITING');

        // Store new version in localStorage
        localStorage.setItem(VERSION_STORAGE_KEY, serverVersion);

        if (autoReloadOnUpdate) {
          window.location.reload();
        }
      }
    } catch (err) {
      // Silently ignore network failures on background check
      console.debug('[CacheControl] Version check error:', err);
    }
  }, [purgeBrowserCaches, notifyServiceWorker, autoReloadOnUpdate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(VERSION_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    } else if (isVersionOutdated(stored, APP_VERSION)) {
      purgeBrowserCaches();
      localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
    }

    // Check on mount
    checkVersion();

    // Check periodically
    const interval = setInterval(checkVersion, checkIntervalMs);

    // Check on window focus / tab visibility change
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [checkVersion, checkIntervalMs, purgeBrowserCaches]);

  return {
    appVersion: APP_VERSION,
    checkVersion,
    purgeBrowserCaches,
  };
}
