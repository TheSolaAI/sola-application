'use client';

import { useVersionCacheControl } from '@/hooks/useVersionCacheControl';

export default function VersionCacheInitializer() {
  useVersionCacheControl();
  return null;
}
