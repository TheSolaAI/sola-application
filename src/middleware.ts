import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const response = NextResponse.next();

  // Skip middleware during OAuth flows
  if (
    req.nextUrl.searchParams.has('privy_oauth_code') ||
    req.nextUrl.searchParams.has('privy_oauth_state') ||
    req.nextUrl.searchParams.has('privy_oauth_provider')
  ) {
    return response;
  }

  // Skip middleware for the refresh page to avoid infinite loops
  if (pathname === '/refresh') {
    return response;
  }

  const cookieAuthToken = req.cookies.get('privy-token');
  const cookieSession = req.cookies.get('privy-session');

  // If the user has an auth token, allow them through
  if (cookieAuthToken) {
    return response;
  }

  // If the user has a session (but no token), redirect to refresh to complete authentication
  if (cookieSession) {
    const encodedRedirect = encodeURIComponent(pathname + req.nextUrl.search);
    return NextResponse.redirect(
      new URL(`/refresh?redirect_uri=${encodedRedirect}`, req.url)
    );
  }

  // If the user is not authenticated, redirect them to the login page
  return NextResponse.redirect(new URL('/', req.url));
}
