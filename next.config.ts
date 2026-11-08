import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import packageInfo from './package.json';

const appVersion = packageInfo.version || '0.0.1';
const buildDate = new Date().toISOString();
const buildId =
  process.env.BUILD_ID ||
  process.env.NEXT_PUBLIC_BUILD_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  `v${appVersion}-${buildDate}`;

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_BUILD_DATE: buildDate,
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  generateBuildId: async () => {
    return buildId;
  },
  headers: async () => {
    return [
      // 1. HTML Pages & Documents: Prevent aggressive caching of stale application files
      {
        source: '/((?!_next/static|_next/image|favicon.ico|icons|images).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
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
            key: 'X-Build-Id',
            value: buildId,
          },
        ],
      },
      // 2. Next.js Static Hashed Assets: Long-term immutable caching
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-App-Version',
            value: appVersion,
          },
          {
            key: 'X-Build-Id',
            value: buildId,
          },
        ],
      },
      // 3. Service Worker: Must never be cached by the browser
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
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
      // 4. API Endpoints: Prevent intermediate and browser caching
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'X-App-Version',
            value: appVersion,
          },
          {
            key: 'X-Build-Id',
            value: buildId,
          },
        ],
      },
    ];
  },
  turbopack: {},
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'solaai',
  project: 'sola-application-frontend',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
