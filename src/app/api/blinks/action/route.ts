import { NextRequest, NextResponse } from 'next/server';
import {
  assertPublicHttpUrl,
  resolveBlinkActionUrl,
} from '@/lib/blinks/urlSafety';

const ACTION_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'Accept-Encoding': 'gzip, deflate, br',
} as const;

async function fetchAction(target: string, init: RequestInit): Promise<Response> {
  const url = assertPublicHttpUrl(resolveBlinkActionUrl(target));
  return fetch(url.toString(), {
    ...init,
    headers: { ...ACTION_HEADERS, ...(init.headers || {}) },
    redirect: 'manual',
  });
}

export async function GET(req: NextRequest) {
  try {
    const urlParam = req.nextUrl.searchParams.get('url');
    if (!urlParam) return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    const res = await fetchAction(urlParam, { method: 'GET' });
    if (res.status >= 300 && res.status < 400) {
      return NextResponse.json({ error: 'Redirects from action endpoints are not followed' }, { status: 502 });
    }
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); }
    catch { return NextResponse.json({ error: 'Action endpoint did not return JSON', body: text.slice(0, 200) }, { status: 502 }); }
    return NextResponse.json({ success: true, data, status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to load blink' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, account, actionHref, data: formData } = body || {};
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    if (!account || typeof account !== 'string') return NextResponse.json({ error: 'Missing account' }, { status: 400 });
    let target = resolveBlinkActionUrl(url);
    if (actionHref && typeof actionHref === 'string' && actionHref.length > 0) target = new URL(actionHref, target).toString();
    assertPublicHttpUrl(target);
    const res = await fetchAction(target, {
      method: 'POST',
      body: JSON.stringify({ account, data: formData || {} }),
    });
    if (res.status >= 300 && res.status < 400) {
      return NextResponse.json({ error: 'Redirects from action endpoints are not followed' }, { status: 502 });
    }
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); }
    catch { return NextResponse.json({ error: 'Action endpoint did not return JSON', body: text.slice(0, 200) }, { status: 502 }); }
    return NextResponse.json({ success: true, data, status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to execute blink action' }, { status: 400 });
  }
}
