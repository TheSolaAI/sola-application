import { NextRequest, NextResponse } from 'next/server';
import {
  extractUserPrivyId,
  verifyUserTier,
  verifySession,
  recordSessionUsage,
} from '@/lib/server/userSession';

/**
 * Creates a new OpenAI realtime session for authenticated users
 * Verifies tier status and session availability before creation
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get('Authorization')?.split(' ')[1];
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token not provided' },
        { status: 401 }
      );
    }

    let privyId;
    try {
      privyId = await extractUserPrivyId(authToken);
    } catch (error) {
      console.error('Error validating token:', error);
      return NextResponse.json(
        { error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    if (!privyId) {
      return NextResponse.json(
        { error: 'Failed to extract user ID from token' },
        { status: 401 }
      );
    }

    const tierInfo = await verifyUserTier(privyId, authToken);
    if (!tierInfo.success || !tierInfo.tier) {
      return NextResponse.json(
        { error: tierInfo.error || 'Failed to verify user tier' },
        { status: 500 }
      );
    }

    const hasSessionsAvailable = await verifySession(privyId, tierInfo.tier);
    console.log(hasSessionsAvailable);
    if (!hasSessionsAvailable) {
      return NextResponse.json(
        {
          error: 'No sessions left. Please try again later.',
          tier: tierInfo.tier,
          totalSolaBalance: tierInfo.totalSolaBalance,
          sessionsAllowed: tierInfo.sessionsAllowed || 0,
        },
        { status: 429 }
      );
    }

    const key = process.env.OPENAI_API_KEY!;
    const response = await fetch(
      'https://api.openai.com/v1/realtime/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-realtime-preview-2024-12-17',
          voice: 'verse',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status}` },
        { status: response.status }
      );
    }

    const sessionData = await response.json();
    const sessionId = sessionData.client_secret?.value || sessionData.id;

    try {
      await recordSessionUsage(privyId, sessionId);
    } catch (dbError) {
      console.error('Error logging session usage:', dbError);
    }

    return NextResponse.json({
      ...sessionData,
      tier: tierInfo.tier,
      sessionsInfo: {
        tier: tierInfo.tier,
        sessionsAllowed: tierInfo.sessionsAllowed || 0,
      },
    });
  } catch (error) {
    console.error('Error creating realtime session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
