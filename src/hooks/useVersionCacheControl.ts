'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  APP_VERSION,
  BUILD_DATE,
  BUILD_ID,
  CACHE_PREFIX,
  compareVersionTokens,
  isVersionOutdated,
} from '@/utils/version';

const VERSION_STORAGE_KEY = 'sola_app_version';
const BUILD_DATE_STORAGE_KEY = 'sola_app_build_date';

export interface VersionCacheControlOptions {
  checkIntervalMs?: number;
  autoReloadOnUpdate?: boolean;
}

/**
 * Hook to manage client-side version validation, stale cache clearing,
 * and service worker registration and synchronization.
 */
export function useVersionCacheControl(
  options: VersionCacheControlOptions = {}
) {
  const { checkIntervalMs = 15 * 60 * 1000, autoReloadOnUpdate = true } =
    options;

  const inFlightCheckRef = useRef<Promise<void> | null>(null);
  const latestObservedVersionRef = useRef<string>(BUILD_ID);
  const latestObservedBuildDateRef = useRef<number>(
    Number.isNaN(Date.parse(BUILD_DATE)) ? 0 : Date.parse(BUILD_DATE)
  );

  const purgeBrowserCaches = useCallback(async () => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheKeys = await caches.keys();
      const appCacheKeys = cacheKeys.filter((key) =>
        key.startsWith(CACHE_PREFIX)
      );
      await Promise.all(
        appCacheKeys.map(async (key) => {
          console.log('[CacheControl] Deleting browser cache key:', key);
          const deleted = await caches.delete(key);
          if (!deleted) {
            throw new Error(`Failed to delete cache key: ${key}`);
          }
        })
      );
    }
  }, []);

  const notifyServiceWorker = useCallback(
    (type: 'SKIP_WAITING' | 'CLEAR_CACHE') => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type });
      }
    },
    []
  );

  const registerServiceWorker = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const swUrl = `/service-worker.js?v=${encodeURIComponent(BUILD_ID)}`;
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
      });
      await registration.update().catch(() => {});
    } catch (err) {
      console.warn('[CacheControl] Service worker registration error:', err);
    }
  }, []);

  const runVersionCheck = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const response = await fetch('/api/version', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) return;

      const data = await response.json();
      const serverVersion: string | undefined =
        data.buildId || data.version || data.cacheVersion;
      if (!serverVersion) return;

      const serverBuildDateMs =
        typeof data.buildDate === 'string' && !Number.isNaN(Date.parse(data.buildDate))
          ? Date.parse(data.buildDate)
          : null;

      const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
      const storedBuildDateRaw = localStorage.getItem(BUILD_DATE_STORAGE_KEY);
      const storedBuildDateMs =
        storedBuildDateRaw && !Number.isNaN(Date.parse(storedBuildDateRaw))
          ? Date.parse(storedBuildDateRaw)
          : null;

      // Reject responses older than what this tab or storage has already observed
      const maxKnownBuildDateMs = Math.max(
        latestObservedBuildDateRef.current,
        storedBuildDateMs ?? 0
      );
      if (
        serverBuildDateMs !== null &&
        maxKnownBuildDateMs > 0 &&
        serverBuildDateMs < maxKnownBuildDateMs
      ) {
        return;
      }

      if (
        compareVersionTokens(
          serverVersion,
          latestObservedVersionRef.current
        ) === -1
      ) {
        return;
      }
      if (
        storedVersion &&
        compareVersionTokens(serverVersion, storedVersion) === -1
      ) {
        return;
      }

      // Compare against the running bundle's BUILD_ID first so already-open tabs
      // still detect updates even after another tab has updated localStorage.
      const bundleOutdated = isVersionOutdated(BUILD_ID, serverVersion);
      const storageOutdated = isVersionOutdated(storedVersion, serverVersion);

      if (bundleOutdated || storageOutdated) {
        console.log(
          `[CacheControl] Version update detected: bundle=${BUILD_ID}, stored=${storedVersion} -> server=${serverVersion}`
        );

        // Purge old cache storage first; only record the new version after purge succeeds
        await purgeBrowserCaches();
        notifyServiceWorker('CLEAR_CACHE');
        notifyServiceWorker('SKIP_WAITING');

        latestObservedVersionRef.current = serverVersion;
        if (serverBuildDateMs !== null) {
          latestObservedBuildDateRef.current = serverBuildDateMs;
        }

        localStorage.setItem(VERSION_STORAGE_KEY, serverVersion);
        if (typeof data.buildDate === 'string') {
          localStorage.setItem(BUILD_DATE_STORAGE_KEY, data.buildDate);
        }

        if (autoReloadOnUpdate) {
          window.location.reload();
        }
      }
    } catch (err) {
      // Do not update stored version when network or cache purge fails so next check retries
      console.debug('[CacheControl] Version check error:', err);
    }
  }, [purgeBrowserCaches, notifyServiceWorker, autoReloadOnUpdate]);

  // Serialize overlapping version checks so slower responses cannot overwrite newer state
  const checkVersion = useCallback(async () => {
    if (inFlightCheckRef.current) {
      return inFlightCheckRef.current;
    }

    const promise = runVersionCheck().finally(() => {
      inFlightCheckRef.current = null;
    });
    inFlightCheckRef.current = promise;
    return promise;
  }, [runVersionCheck]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    registerServiceWorker();

    const syncLocalBuildVersion = async () => {
      const stored = localStorage.getItem(VERSION_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(VERSION_STORAGE_KEY, BUILD_ID);
        localStorage.setItem(BUILD_DATE_STORAGE_KEY, BUILD_DATE);
      } else if (isVersionOutdated(stored, BUILD_ID)) {
        try {
          await purgeBrowserCaches();
          localStorage.setItem(VERSION_STORAGE_KEY, BUILD_ID);
          localStorage.setItem(BUILD_DATE_STORAGE_KEY, BUILD_DATE);
        } catch (err) {
          console.warn('[CacheControl] Initial cache purge failed:', err);
        }
      }
    };

    syncLocalBuildVersion().then(() => {
      checkVersion();
    });

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
  }, [
    checkVersion,
    checkIntervalMs,
    purgeBrowserCaches,
    registerServiceWorker,
  ]);

  return {
    appVersion: APP_VERSION,
    buildId: BUILD_ID,
    checkVersion,
    purgeBrowserCaches,
  };
}
