/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validates if the request is from an authorized mobile client
 * Uses a combination of mobile-client-id and mobile-api-key headers
 */
export function isValidMobileClient(req: Request): boolean {
  const clientId = req.headers.get('x-mobile-client-id');
  const apiKey = req.headers.get('x-mobile-api-key');
  const expectedApiKeys: Record<string, string> = {
    'ios-app': process.env.IOS_MOBILE_API_KEY || '',
    'android-app': process.env.ANDROID_MOBILE_API_KEY || '',
  };
  if (!clientId || !apiKey || !expectedApiKeys[clientId]) {
    return false;
  }
  return timingSafeEqual(apiKey, expectedApiKeys[clientId]);
}
