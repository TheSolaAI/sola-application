// src/app/api/user/sola-balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { SOLA_TOKEN_ADDRESS } from '@/config/constants';
import {
  SolaBalanceDataSchema,
  SolaWalletBalance,
  createSuccessResponse,
  createErrorResponse,
} from '@/types/schemas/solaBalanceSchema';
import { z } from 'zod';

const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || '';

/**
 * Server-side API endpoint to fetch SOLA token balances for all user wallets
 */
export async function GET(req: NextRequest) {
  try {
    // Validate authorization header
    const authToken = req.headers.get('Authorization')?.split(' ')[1];
    if (!authToken) {
      return NextResponse.json(createErrorResponse('Unauthorized'), {
        status: 401,
      });
    }

    // Fetch the user's wallets from the auth service
    let wallets;
    try {
      const walletResponse = await axios.get(
        `${AUTH_SERVICE_URL}auth/wallet/`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      wallets = walletResponse.data;

      // Validate the wallet data structure (basic validation)
      if (!wallets || !Array.isArray(wallets)) {
        throw new Error(
          'Invalid wallet data format received from auth service'
        );
      }
    } catch (error: any) {
      console.error(
        'Error fetching wallets:',
        error.response?.data || error.message
      );

      // Check if token expired (based on your API error format)
      if (error.response?.status === 401) {
        return NextResponse.json(
          createErrorResponse('Authentication token expired'),
          { status: 401 }
        );
      }

      return NextResponse.json(
        createErrorResponse('Failed to fetch user wallets'),
        { status: 500 }
      );
    }

    if (wallets.length === 0) {
      return NextResponse.json(
        createErrorResponse('No wallets found for user'),
        { status: 404 }
      );
    }

    // Process each wallet to get SOLA balances
    const solaBalances: SolaWalletBalance[] = await Promise.all(
      wallets.map(async (wallet) => {
        const walletAddress = wallet.wallet_address;
        const balance = await getSolaBalance(walletAddress);

        return {
          walletAddress,
          walletProvider: wallet.wallet_provider,
          solaBalance: balance,
        };
      })
    );

    // Calculate total balance across all wallets
    const totalSolaBalance = solaBalances.reduce(
      (total, wallet) => total + (wallet.solaBalance || 0),
      0
    );

    // Validate response data against schema
    const responseData = {
      wallets: solaBalances,
      totalSolaBalance,
    };

    try {
      // Validate against schema
      SolaBalanceDataSchema.parse(responseData);

      return NextResponse.json(createSuccessResponse(responseData));
    } catch (validationError) {
      // If validation fails, log and return error
      console.error(
        'Validation error in SOLA balance response:',
        validationError
      );

      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse(
            `Data validation error: ${validationError.errors.map((e) => e.message).join(', ')}`
          ),
          { status: 500 }
        );
      }

      throw validationError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error fetching SOLA balances:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch SOLA balances'),
      { status: 500 }
    );
  }
}

/**
 * Fetches SOLA token balance for a wallet using RPC API
 */
async function getSolaBalance(walletAddress: string): Promise<number> {
  if (!SOLANA_RPC_URL) {
    console.error('Solana RPC URL not configured');
    return 0;
  }

  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'sola-balance',
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          tokenType: 'fungible',
          grouping: ['mint'],
          displayOptions: {
            showNativeBalance: true,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.result || !data.result.items) {
      console.error('Unexpected response format from RPC API');
      return 0;
    }

    // Find SOLA token in the results
    const solaToken = data.result.items.find(
      (item: any) => item.id?.toLowerCase() === SOLA_TOKEN_ADDRESS.toLowerCase()
    );

    if (solaToken && solaToken.token_info) {
      // Get the balance and convert to human-readable format
      const rawBalance = solaToken.token_info.balance;
      const decimals = solaToken.token_info.decimals || 9;
      return rawBalance / Math.pow(10, decimals);
    }

    return 0;
  } catch (error) {
    console.error(
      `Error fetching SOLA balance for wallet ${walletAddress}:`,
      error
    );
    return 0;
  }
}
