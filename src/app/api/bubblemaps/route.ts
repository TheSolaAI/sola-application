// app/api/bubblemaps/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  const limit = searchParams.get('limit');

  if (
    !address ||
    !chain ||
    !limit ||
    isNaN(Number(limit)) ||
    Number(limit) < 1 ||
    Number(limit) > 100
  ) {
    return NextResponse.json(
      { error: 'Invalid or missing parameters' },
      { status: 400 }
    );
  }

  const partnerId = process.env.BUBBLEMAPS_API_KEY;
  if (!partnerId) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const baseUrl = 'https://iframe.bubblemaps.io'; // Original domain for rewriting
  const externalUrl = `${baseUrl}/map?partnerId=${partnerId}&address=${address}&chain=${chain}&limit=${limit}`;
  console.log('Fetching:', externalUrl);

  try {
    const response = await fetch(externalUrl, {
      headers: {
        'Accept-Encoding': 'br, gzip, deflate',
      },
    });
    console.log(
      'External response headers:',
      Object.fromEntries(response.headers)
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Fetch failed: ${response.status} - ${errorBody}`);
    }

    // Consume and decode the HTML
    let htmlText = await response.text();
    console.log('Fetched HTML snippet:', htmlText.substring(0, 500));

    // Rewrite relative URLs to absolute (e.g., /assets/ -> https://iframe.bubblemaps.io/assets/)
    htmlText = htmlText.replace(
      /(src|href)=["']\/(?!\/)([^"']+)["']/g,
      `$1="${baseUrl}/$2"`
    );

    // Recreate a ReadableStream from the modified HTML
    const modifiedStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(htmlText));
        controller.close();
      },
    });

    // Forward headers, excluding compression ones
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'content-encoding' &&
        lowerKey !== 'transfer-encoding' &&
        lowerKey !== 'content-length' &&
        lowerKey !== 'vary'
      ) {
        headers.set(key, value);
      }
    });
    headers.set('Content-Type', 'text/html; charset=UTF-8');
    headers.set('Content-Length', htmlText.length.toString());

    // Preserve CSP, but append your domain if needed for iframe embedding
    let csp = response.headers.get('Content-Security-Policy') || '';
    csp += '; frame-ancestors http://localhost:5173 https://localhost:5173'; // Add your dev domain
    headers.set('Content-Security-Policy', csp);

    return new NextResponse(modifiedStream, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy failed', details: error },
      { status: 500 }
    );
  }
}
