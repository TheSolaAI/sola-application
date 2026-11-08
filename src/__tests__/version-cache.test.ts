import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  APP_VERSION,
  BUILD_ID,
  CACHE_PREFIX,
  compareVersionTokens,
  getBuildVersion,
  getCacheVersion,
  isVersionOutdated,
  getAppVersionInfo,
  CACHE_CONTROL_PRESETS,
  getNextCacheHeaders,
} from '../utils/version.ts';

describe('version and cache control utils', () => {
  describe('APP_VERSION and version getters', () => {
    it('provides a default or configured APP_VERSION and BUILD_ID', () => {
      assert.strictEqual(typeof APP_VERSION, 'string');
      assert.strictEqual(APP_VERSION.length > 0, true);
      assert.strictEqual(typeof BUILD_ID, 'string');
      assert.strictEqual(BUILD_ID.length > 0, true);
    });

    it('generates a valid formatted build version string', () => {
      const buildVersion = getBuildVersion();
      assert.strictEqual(typeof buildVersion, 'string');
      assert.strictEqual(buildVersion.startsWith(`v${APP_VERSION}-`), true);
    });

    it('generates versioned cache names for service worker isolation', () => {
      assert.strictEqual(getCacheVersion('0.0.1'), 'sola-ai-v0.0.1');
      assert.strictEqual(getCacheVersion('1.2.0'), 'sola-ai-v1.2.0');
      assert.strictEqual(getCacheVersion(), `${CACHE_PREFIX}${BUILD_ID}`);
    });

    it('returns complete structured app version info', () => {
      const info = getAppVersionInfo();
      assert.strictEqual(info.version, APP_VERSION);
      assert.strictEqual(info.buildId, BUILD_ID);
      assert.strictEqual(typeof info.buildDate, 'string');
      assert.strictEqual(info.cacheVersion, `${CACHE_PREFIX}${BUILD_ID}`);
      assert.strictEqual(typeof info.environment, 'string');
    });
  });

  describe('isVersionOutdated & compareVersionTokens', () => {
    it('flags null or undefined client versions as outdated', () => {
      assert.strictEqual(isVersionOutdated(null, '1.0.0'), true);
      assert.strictEqual(isVersionOutdated(undefined, '1.0.0'), true);
      assert.strictEqual(isVersionOutdated('', '1.0.0'), true);
    });

    it('flags newer server versions or newer same-day builds as outdated', () => {
      assert.strictEqual(isVersionOutdated('0.0.1', '0.0.2'), true);
      assert.strictEqual(isVersionOutdated('1.0.0', '1.0.1'), true);
      assert.strictEqual(
        isVersionOutdated(
          'v0.0.1-2026-11-08T08:00:00.000Z',
          'v0.0.1-2026-11-08T09:00:00.000Z'
        ),
        true
      );
    });

    it('rejects older server versions to prevent rollback loops', () => {
      assert.strictEqual(compareVersionTokens('1.0.0', '1.0.1'), -1);
      assert.strictEqual(isVersionOutdated('1.0.1', '1.0.0'), false);
      assert.strictEqual(
        isVersionOutdated(
          'v0.0.1-2026-11-08T09:00:00.000Z',
          'v0.0.1-2026-11-08T08:00:00.000Z'
        ),
        false
      );
    });

    it('confirms identical versions are not outdated', () => {
      assert.strictEqual(isVersionOutdated('1.0.0', '1.0.0'), false);
      assert.strictEqual(isVersionOutdated(' 1.0.0 ', '1.0.0'), false);
      assert.strictEqual(isVersionOutdated(BUILD_ID), false);
    });
  });

  describe('CACHE_CONTROL_PRESETS', () => {
    it('defines strict no-cache headers for dynamic HTML documents', () => {
      assert.strictEqual(
        CACHE_CONTROL_PRESETS.htmlDocument.includes('no-cache'),
        true
      );
      assert.strictEqual(
        CACHE_CONTROL_PRESETS.htmlDocument.includes('no-store'),
        true
      );
      assert.strictEqual(
        CACHE_CONTROL_PRESETS.htmlDocument.includes('must-revalidate'),
        true
      );
    });

    it('defines immutable long-term headers for static hashed assets', () => {
      assert.strictEqual(
        CACHE_CONTROL_PRESETS.staticImmutable.includes('immutable'),
        true
      );
      assert.strictEqual(
        CACHE_CONTROL_PRESETS.staticImmutable.includes('max-age=31536000'),
        true
      );
    });

    it('defines un-cached headers for service workers', () => {
      assert.strictEqual(
        CACHE_CONTROL_PRESETS.serviceWorker.includes('no-cache'),
        true
      );
      assert.strictEqual(
        CACHE_CONTROL_PRESETS.serviceWorker.includes('max-age=0'),
        true
      );
    });

    it('defines strict no-cache headers for API routes', () => {
      assert.strictEqual(CACHE_CONTROL_PRESETS.api.includes('no-store'), true);
      assert.strictEqual(CACHE_CONTROL_PRESETS.api.includes('no-cache'), true);
    });
  });

  describe('getNextCacheHeaders', () => {
    it('generates Next.js header rules with correct targets and consistent version injection', () => {
      const headers = getNextCacheHeaders('2.0.0');
      assert.strictEqual(headers.length >= 4, true);

      // Rule for HTML/document pages
      const htmlRule = headers.find((h) =>
        h.source.includes('(?!_next/static')
      );
      assert.ok(htmlRule, 'Should have a rule for HTML document pages');
      const htmlCacheControl = htmlRule?.headers.find(
        (h) => h.key === 'Cache-Control'
      );
      assert.strictEqual(
        htmlCacheControl?.value,
        CACHE_CONTROL_PRESETS.htmlDocument
      );
      const htmlVersion = htmlRule?.headers.find(
        (h) => h.key === 'X-App-Version'
      );
      assert.strictEqual(htmlVersion?.value, '2.0.0');
      const htmlCacheVersion = htmlRule?.headers.find(
        (h) => h.key === 'X-Cache-Version'
      );
      assert.strictEqual(htmlCacheVersion?.value, 'sola-ai-v2.0.0');

      // Rule for static hashed assets
      const staticRule = headers.find((h) => h.source === '/_next/static/:path*');
      assert.ok(staticRule, 'Should have a rule for _next/static');
      const staticCacheControl = staticRule?.headers.find(
        (h) => h.key === 'Cache-Control'
      );
      assert.strictEqual(
        staticCacheControl?.value,
        CACHE_CONTROL_PRESETS.staticImmutable
      );

      // Rule for service worker
      const swRule = headers.find((h) => h.source === '/service-worker.js');
      assert.ok(swRule, 'Should have a rule for /service-worker.js');
      const swCacheControl = swRule?.headers.find(
        (h) => h.key === 'Cache-Control'
      );
      assert.strictEqual(
        swCacheControl?.value,
        CACHE_CONTROL_PRESETS.serviceWorker
      );

      // Rule for API routes
      const apiRule = headers.find((h) => h.source === '/api/:path*');
      assert.ok(apiRule, 'Should have a rule for /api/:path*');
      const apiCacheControl = apiRule?.headers.find(
        (h) => h.key === 'Cache-Control'
      );
      assert.strictEqual(apiCacheControl?.value, CACHE_CONTROL_PRESETS.api);
    });
  });
});
