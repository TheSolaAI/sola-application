// Get the version from package.json or environment
// This will be updated by semantic-release during CI/CD
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1';

export const BUILD_DATE =
  process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString();

export const BUILD_ID =
  process.env.BUILD_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  `v${APP_VERSION}-${BUILD_DATE.split('T')[0]}`;

// Format: v{version}-{environment}-{buildDate}
export const getBuildVersion = () => {
  const environment = process.env.NODE_ENV || 'development';
  const buildDate = BUILD_DATE.split('T')[0];
  return `v${APP_VERSION}-${environment}-${buildDate}`;
};

// Use this for cache versioning in service worker and browser cache storage
export const getCacheVersion = (version: string = APP_VERSION) =>
  `sola-ai-v${version}`;

/**
 * Returns structured application version and build metadata.
 */
export const getAppVersionInfo = () => {
  const environment = process.env.NODE_ENV || 'development';
  return {
    version: APP_VERSION,
    buildId: BUILD_ID,
    buildDate: BUILD_DATE,
    environment,
    cacheVersion: getCacheVersion(APP_VERSION),
  };
};

/**
 * Compares client and server version strings to determine whether client cache is outdated.
 */
export const isVersionOutdated = (
  clientVersion: string | null | undefined,
  serverVersion: string = APP_VERSION
): boolean => {
  if (!clientVersion) return true;
  return clientVersion.trim() !== serverVersion.trim();
};

/**
 * Standard Cache-Control header presets for different resource classifications.
 */
export const CACHE_CONTROL_PRESETS = {
  // Dynamic HTML / App documents: must never be served stale from browser cache
  htmlDocument: 'no-cache, no-store, must-revalidate, max-age=0',
  // API endpoints: strictly non-cached
  api: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  // Service worker script: must never be cached by browser
  serviceWorker: 'no-cache, no-store, must-revalidate, max-age=0',
  // Content-hashed static assets (_next/static): immutable long-term caching
  staticImmutable: 'public, max-age=31536000, immutable',
  // Public static assets (icons, images): revalidate with reasonable max-age
  publicAsset: 'public, max-age=86400, stale-while-revalidate=604800',
};

/**
 * Generates version-based HTTP headers for Next.js next.config.ts headers configuration.
 */
export const getNextCacheHeaders = (appVersion: string = APP_VERSION) => {
  const versionInfo = getAppVersionInfo();

  return [
    // 1. Root & Dynamic HTML Pages: Prevent aggressive browser caching of stale HTML
    {
      source: '/((?!_next/static|_next/image|favicon.ico|icons|images).*)',
      headers: [
        {
          key: 'Cache-Control',
          value: CACHE_CONTROL_PRESETS.htmlDocument,
        },
        {
          key: 'Pragma',
          value: 'no-cache',
        },
        {
          key: 'Expires',
          value: '0',
        },
        {
          key: 'X-App-Version',
          value: appVersion,
        },
        {
          key: 'X-Cache-Version',
          value: versionInfo.cacheVersion,
        },
      ],
    },
    // 2. Next.js Hashed Static Assets: Long-term immutable caching
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: CACHE_CONTROL_PRESETS.staticImmutable,
        },
        {
          key: 'X-App-Version',
          value: appVersion,
        },
      ],
    },
    // 3. Service Worker Script: Ensure browser checks for worker updates on every load
    {
      source: '/service-worker.js',
      headers: [
        {
          key: 'Cache-Control',
          value: CACHE_CONTROL_PRESETS.serviceWorker,
        },
        {
          key: 'Pragma',
          value: 'no-cache',
        },
        {
          key: 'Expires',
          value: '0',
        },
      ],
    },
    // 4. API Endpoints: Prevent intermediate or browser response caching
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: CACHE_CONTROL_PRESETS.api,
        },
        {
          key: 'Pragma',
          value: 'no-cache',
        },
        {
          key: 'X-App-Version',
          value: appVersion,
        },
      ],
    },
  ];
};
