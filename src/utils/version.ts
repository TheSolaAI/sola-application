// Get the version from package.json or environment
// This will be updated by semantic-release during CI/CD
export const CACHE_PREFIX = 'sola-ai-v';

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1';

export const BUILD_DATE =
  process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString();

export const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ||
  process.env.BUILD_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  `v${APP_VERSION}-${BUILD_DATE}`;

// Format: v{version}-{environment}-{buildDate}
export const getBuildVersion = () => {
  const environment = process.env.NODE_ENV || 'development';
  return `v${APP_VERSION}-${environment}-${BUILD_DATE}`;
};

// Use this for cache versioning in service worker and browser cache storage
export const getCacheVersion = (version: string = BUILD_ID) => {
  const normalized = version.trim();
  return normalized.startsWith(CACHE_PREFIX)
    ? normalized
    : `${CACHE_PREFIX}${normalized}`;
};

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
    cacheVersion: getCacheVersion(BUILD_ID),
  };
};

interface ParsedVersionToken {
  semver: number[] | null;
  timestampMs: number | null;
  raw: string;
}

function parseVersionToken(input: string): ParsedVersionToken {
  const trimmed = input.trim().replace(/^sola-ai-v/, '');
  const semverMatch = trimmed.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!semverMatch) {
    const directTs = Date.parse(trimmed);
    return {
      semver: null,
      timestampMs: Number.isNaN(directTs) ? null : directTs,
      raw: trimmed,
    };
  }

  const semver = [
    Number(semverMatch[1]),
    Number(semverMatch[2]),
    Number(semverMatch[3]),
  ];
  const suffix = semverMatch[4];
  let timestampMs: number | null = null;
  if (suffix) {
    const parsedTs = Date.parse(suffix);
    if (!Number.isNaN(parsedTs)) {
      timestampMs = parsedTs;
    }
  }

  return { semver, timestampMs, raw: trimmed };
}

/**
 * Compares two version/build identifiers:
 *  - returns 1 if `candidate` is newer than `reference`
 *  - returns -1 if `candidate` is older than `reference`
 *  - returns 0 if identical
 *  - returns null if ordering cannot be determined (e.g., two different opaque commit SHAs)
 */
export const compareVersionTokens = (
  candidate: string,
  reference: string
): number | null => {
  const a = candidate.trim();
  const b = reference.trim();
  if (a === b) return 0;

  const parsedA = parseVersionToken(a);
  const parsedB = parseVersionToken(b);

  if (parsedA.semver && parsedB.semver) {
    for (let i = 0; i < 3; i += 1) {
      if (parsedA.semver[i] > parsedB.semver[i]) return 1;
      if (parsedA.semver[i] < parsedB.semver[i]) return -1;
    }
  }

  if (parsedA.timestampMs !== null && parsedB.timestampMs !== null) {
    if (parsedA.timestampMs > parsedB.timestampMs) return 1;
    if (parsedA.timestampMs < parsedB.timestampMs) return -1;
    return 0;
  }

  return null;
};

/**
 * Compares client and server version strings to determine whether client cache is outdated.
 * Rejects server versions that are older than the client version to prevent rollback loops.
 */
export const isVersionOutdated = (
  clientVersion: string | null | undefined,
  serverVersion: string = BUILD_ID
): boolean => {
  if (!clientVersion || !clientVersion.trim()) return true;
  if (!serverVersion || !serverVersion.trim()) return false;

  const comparison = compareVersionTokens(serverVersion, clientVersion);
  if (comparison === 0) return false;
  if (comparison === -1) return false; // Server response is older than client version
  if (comparison === 1) return true;

  // Opaque build identifiers (e.g., commit SHAs) that differ
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
  const cacheVersion = getCacheVersion(appVersion);

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
          value: cacheVersion,
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
