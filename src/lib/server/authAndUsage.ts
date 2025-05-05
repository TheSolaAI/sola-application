import { cookies } from 'next/headers';
import { extractUserPrivyId } from '@/lib/server/userSession';
import { NextResponse } from 'next/server';
import { hasExceededUsageLimit } from '@/lib/server/userTier';
import { isValidMobileClient } from '@/lib/server/isMobileClient';
import { UserTierStatus } from '@/types/tier';

type AuthResult = {
  isAuthenticated: boolean;
  privyId?: string;
  accessToken?: string;
  error?: {
    message: string;
    status: number;
  };
  usageLimit?: UserTierStatus;
};

/**
 * Handles authentication and usage limit checks
 * @param req - The incoming HTTP request
 * @param checkUsageLimit - Whether to check usage limits (default: true)
 * @returns Authentication result with privyId and usageLimit info
 */
export async function authenticateAndCheckUsage(
  req: Request,
  checkUsageLimit: boolean = true
): Promise<AuthResult> {
  // Check if request is from a mobile client
  const isMobileClient = isValidMobileClient(req);
  console.log(
    isMobileClient ? 'Mobile client detected' : 'Web client detected'
  );

  // Extract access token either from headers (mobile) or cookies (web)
  let accessToken: string | undefined;
  if (isMobileClient) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return {
        isAuthenticated: false,
        error: { message: 'Unauthorized', status: 401 },
      };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return {
        isAuthenticated: false,
        error: { message: 'Unauthorized', status: 401 },
      };
    }
    accessToken = token;
  } else {
    const cookieStore = await cookies();
    accessToken = cookieStore.get('privy-token')?.value;
  }

  if (!accessToken) {
    return {
      isAuthenticated: false,
      error: { message: 'Unauthorized', status: 401 },
    };
  }

  // Extract and validate privyId
  let privyId: string;
  try {
    privyId = await extractUserPrivyId(accessToken, isMobileClient);
  } catch (error) {
    console.error('Error validating token:', error);
    return {
      isAuthenticated: false,
      error: {
        message: 'Invalid or expired authentication token',
        status: 401,
      },
    };
  }

  if (!privyId) {
    return {
      isAuthenticated: false,
      error: {
        message: 'Failed to extract user ID from token',
        status: 401,
      },
    };
  }

  // Check usage limits if required
  let usageLimit;
  if (
    checkUsageLimit &&
    !isMobileClient &&
    process.env.NODE_ENV === 'production'
  ) {
    usageLimit = await hasExceededUsageLimit(privyId);
    if (!usageLimit.active) {
      return {
        isAuthenticated: true,
        privyId,
        accessToken,
        usageLimit,
        error: {
          message: 'Usage limit exceeded',
          status: 403,
        },
      };
    }
  }

  // Success path
  return {
    isAuthenticated: true,
    privyId,
    accessToken,
    usageLimit,
  };
}

/**
 * Creates an error response based on authentication result
 */
export function createErrorResponseFromAuth(authResult: AuthResult): Response {
  if (!authResult.error) {
    throw new Error('Cannot create error response from successful auth result');
  }

  return NextResponse.json(
    {
      error: authResult.error.message,
      usageLimit: authResult.usageLimit,
    },
    { status: authResult.error.status }
  );
}
