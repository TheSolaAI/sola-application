// app/api/bubblemap-iframe/route.ts
import { NextRequest } from 'next/server';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'solana';
    const limit = searchParams.get('limit') || '80';

    // Validate required parameters
    if (!address) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Address parameter is required',
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get partner ID from environment (kept secure on server-side)
    const partnerToken = process.env.BUBBLEMAPS_API_KEY;
    if (!partnerToken) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Server configuration error: Missing BUBBLEMAPS_API_KEY',
        } as ErrorResponse),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Build the secure Bubblemaps URL
    const bubblemapUrl = `https://iframe.bubblemaps.io/map?partnerId=${partnerToken}&address=${address}&chain=${chain}&limit=${limit}`;

    // Fetch the iframe content
    const response = await fetch(bubblemapUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Bubblemaps API request failed with status ${response.status}`
      );
    }

    const htmlContent = await response.text();

    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching Bubblemaps data:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Error fetching Bubblemaps data';

    const errorResponse: ErrorResponse = {
      status: 'error',
      message: errorMessage,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
