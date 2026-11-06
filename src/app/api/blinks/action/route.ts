import { NextResponse } from 'next/server';
import {
  assertSafeBlinkUrl,
  assertValidBlinkTransaction,
  BlinkActionMetadata,
  resolveBlinkActionHref,
  SOLANA_ACTION_HEADERS,
} from '@/lib/blinks/actionExecutor';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');
    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required "url" query parameter.' },
        { status: 400 }
      );
    }

    const safeUrl = assertSafeBlinkUrl(rawUrl);
    const response = await fetch(safeUrl.toString(), {
      method: 'GET',
      headers: SOLANA_ACTION_HEADERS,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Blink metadata request failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const metadata = (await response.json()) as BlinkActionMetadata;
    if (!metadata || typeof metadata.title !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Blink endpoint returned invalid action metadata.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      actionUrl: safeUrl.toString(),
      metadata,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load Blink metadata.',
      },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      actionUrl,
      href,
      account,
      parameters = {},
    }: {
      actionUrl?: string;
      href?: string;
      account?: string;
      parameters?: Record<string, string>;
    } = body ?? {};

    if (!actionUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required "actionUrl" field.' },
        { status: 400 }
      );
    }

    if (!account || !account.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing required "account" wallet address.' },
        { status: 400 }
      );
    }

    const resolvedTarget = resolveBlinkActionHref(
      href || actionUrl,
      actionUrl,
      parameters
    );

    const response = await fetch(resolvedTarget.toString(), {
      method: 'POST',
      headers: {
        ...SOLANA_ACTION_HEADERS,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account: account.trim() }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const remoteMessage =
        payload?.error?.message ||
        payload?.message ||
        `Blink action request failed with status ${response.status}`;
      return NextResponse.json(
        { success: false, error: remoteMessage },
        { status: response.status }
      );
    }

    const transaction = assertValidBlinkTransaction(payload?.transaction);
    return NextResponse.json({
      success: true,
      transaction,
      message:
        typeof payload?.message === 'string' ? payload.message : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to execute Blink action.',
      },
      { status: 400 }
    );
  }
}
