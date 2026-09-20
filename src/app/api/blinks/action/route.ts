import { NextResponse } from 'next/server';
import { getBlinkMetadata, postBlinkAction } from '@/lib/blinks';

/**
 * Proxy for Solana Actions ("blinks") endpoints.
 * GET  /api/blinks/action?url=<blinkUrl>  -> action metadata
 * POST /api/blinks/action  { url, account, params? } -> { transaction, message }
 * All upstream requests are validated against private/SSRF targets.
 */
export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const metadata = await getBlinkMetadata(url);
    return NextResponse.json(metadata);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch blink';
    const status = /invalid|not allowed|https/i.test(message) ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  let body: { url?: string; account?: string; params?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!body.url || !body.account) {
    return NextResponse.json(
      { error: 'Missing url or account' },
      { status: 400 }
    );
  }

  try {
    const result = await postBlinkAction(
      body.url,
      body.account,
      body.params ?? {}
    );
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to execute blink action';
    const status = /invalid|not allowed|https|public key/i.test(message)
      ? 400
      : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
