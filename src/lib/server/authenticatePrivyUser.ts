'only server';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrivyClient } from '@privy-io/server-auth';

// Initialize Privy client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);
const PRIVY_VERIFICATION_KEY = process.env.PRIVY_VERIFICATION_KEY || '';

// Initialize Prisma client
const prisma = new PrismaClient();

interface AuthResult {
  success: boolean;
  userId?: number;
  privyUserId?: string;
  error?: string;
  status?: number;
}

/**
 * Authenticates a user using Privy token and returns their database user ID
 * @param req NextRequest object containing the authorization header
 * @returns Object with authentication result including user ID if successful
 */
export async function authenticatePrivyUser(
  req: NextRequest
): Promise<AuthResult> {
  try {
    // Get authorization token
    const authToken = req.headers.get('Authorization')?.split(' ')[1];
    if (!authToken) {
      return {
        success: false,
        error: 'Unauthorized: No authorization token provided',
        status: 401,
      };
    }

    // Verify token using Privy SDK
    let privyUserId: string;
    try {
      const verifiedClaims = await privy.verifyAuthToken(
        authToken,
        PRIVY_VERIFICATION_KEY
      );

      privyUserId = verifiedClaims.userId;
      if (!privyUserId) {
        throw new Error('User ID not found in verified claims');
      }
    } catch (error) {
      console.error('Error verifying Privy auth token:', error);
      return {
        success: false,
        error: 'Invalid or expired authentication token',
        status: 401,
      };
    }

    // Get user's database ID from Privy ID
    try {
      const userRecord = await prisma.authw_user.findFirst({
        where: {
          // Assuming username is used to store Privy ID
          username: privyUserId,
        },
      });

      if (!userRecord) {
        return {
          success: false,
          error: `No user found with Privy ID: ${privyUserId}`,
          status: 404,
        };
      }

      return {
        success: true,
        userId: userRecord.id,
        privyUserId,
      };
    } catch (error) {
      console.error('Error finding user in database:', error);
      return {
        success: false,
        error: 'Failed to retrieve user from database',
        status: 500,
      };
    }
  } catch (error) {
    console.error('Error in authenticatePrivyUser:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 500,
    };
  }
}
