import { NextRequest } from 'next/server';

type ErrorResponse = {
  status: 'error';
  message: string;
};

type TwitterTrendingData = {
  views: number;
  token_address: string;
  name: string;
  ticker: string;
  image_url?: string;
  mc: number;
};

type SuccessResponse = {
  status: 'success';
  data: TwitterTrendingData[];
  timestamp: number;
};

type TwitterTrendingDataResponse = {
  twitter_trending: TwitterTrendingData[];
};

export async function GET(request: NextRequest) {
  try {
    // Get API key from environment variables
    const partnerToken = process.env.MCT_API_KEY;

    if (!partnerToken) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Server configuration error: Missing MCT_API_KEY',
        } as ErrorResponse),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch data from memecointracker API
    const response = await fetch(
      'https://memecointracker.com/api/twitter-trending',
      {
        headers: {
          'Content-Type': 'application/json',
          'x-partner-token': partnerToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse response and properly type it
    const rawData = (await response.json()) as TwitterTrendingDataResponse;

    // Apply image fallback logic to each token in the response
    const processedData: TwitterTrendingData[] = rawData.twitter_trending.map(
      (token: TwitterTrendingData) => {
        // If image_url is missing, use fallback format
        if (!token.image_url) {
          return {
            ...token,
            image_url: `https://www.memecointracker.com/images/token-logos/${token.token_address}.jpg`,
          };
        }
        return token;
      }
    );

    const responseData: SuccessResponse = {
      status: 'success',
      data: processedData,
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching Twitter trending data:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Error fetching Twitter trending data';

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
