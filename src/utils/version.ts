// Get the version from package.json
// This will be updated by semantic-release
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1';

// Format: v{version}-{environment}-{buildDate}
export const getBuildVersion = () => {
  const environment = process.env.NODE_ENV || 'development';
  const buildDate = new Date().toISOString().split('T')[0];
  return `v${APP_VERSION}-${environment}-${buildDate}`;
};

// Use this for cache versioning in service worker
export const getCacheVersion = () => `sola-ai-${APP_VERSION}`;
