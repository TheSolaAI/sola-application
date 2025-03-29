// app/api/openai/create-realtime-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticatePrivyUser } from '@/lib/server/authenticatePrivyUser';
import { SESSIONS_PER_TIER } from '@/config/constants';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user using Privy
    const authResult = await authenticatePrivyUser(req);
    console.log(authResult);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    const userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to fetch user id' },
        { status: 500 }
      );
    }

    // Get user's session metrics or create if doesn't exist
    let userMetrics = await prisma.user_analytics_session_metrics.findUnique({
      where: { user_id: userId },
    });

    if (!userMetrics) {
      userMetrics = await prisma.user_analytics_session_metrics.create({
        data: {
          user_id: userId,
        },
      });
    }

    // Check if 3-hour period has passed and reset sessions if needed
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    const timeSincePeriodStart =
      Date.now() - userMetrics.current_period_started_at.getTime();

    if (timeSincePeriodStart >= threeHoursInMs) {
      // Reset period and refill sessions based on tier
      const sessionLimit = SESSIONS_PER_TIER[userMetrics.user_tier] || 0;

      userMetrics = await prisma.user_analytics_session_metrics.update({
        where: { user_id: userId },
        data: {
          sessions_left: sessionLimit,
          current_period_started_at: new Date(),
        },
      });
    }

    // Check if user has sessions left
    if (userMetrics.sessions_left <= 0) {
      return NextResponse.json(
        {
          error: 'No sessions left. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Create OpenAI session
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

    // Update session metrics directly
    await prisma.user_analytics_session_metrics.update({
      where: { user_id: userId },
      data: {
        sessions_created: { increment: 1 },
        sessions_left: { decrement: 1 },
        current_session_id: sessionId,
        current_session_created_at: new Date(),
      },
    });

    // Asynchronous tier verification (non-blocking)
    fetch(new URL('/api/user/verify-tier', req.url).toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${req.headers.get('Authorization')?.split(' ')[1] || ''}`,
        'Content-Type': 'application/json',
      },
    }).catch((err) => {
      console.error('Failed to trigger tier verification:', err);
    });

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error creating realtime session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
