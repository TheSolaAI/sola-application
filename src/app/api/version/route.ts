import { NextResponse } from 'next/server';
import { getAppVersionInfo, CACHE_CONTROL_PRESETS } from '@/utils/version';

export const dynamic = 'force-dynamic';

export async function GET() {
  const versionInfo = getAppVersionInfo();

  return NextResponse.json(versionInfo, {
    status: 200,
    headers: {
      'Cache-Control': CACHE_CONTROL_PRESETS.api,
      'Pragma': 'no-cache',
      'X-App-Version': versionInfo.version,
      'X-Cache-Version': versionInfo.cacheVersion,
    },
  });
}
