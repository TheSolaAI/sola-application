import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { getDomainKeySync, NameRegistryState } from '@bonfida/spl-name-service';

// Singleton Connection instance
let connection: Connection | null = null;

// Initialize the Connection only once
function getConnection(): Connection {
  if (!connection) {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      throw new Error('SOLANA_RPC_URL environment variable is not set');
    }

    // Create the connection with specific config for improved performance
    connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
      disableRetryOnRateLimit: false,
      confirmTransactionInitialTimeout: 30000,
    });

    console.log('Solana connection initialized');
  }

  return connection;
}

// Validate domain name with proper format
function isValidDomainName(domainName: string): boolean {
  const regex = /^[a-zA-Z0-9_-]+\.sol$/;
  return regex.test(domainName);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');

    // Check if domain parameter exists
    if (!domain) {
      return NextResponse.json(
        { error: 'Missing domain parameter' },
        { status: 400 }
      );
    }

    // Validate domain format
    const cleanDomain = domain.trim().toLowerCase();
    if (!isValidDomainName(cleanDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format. Must be in the format "name.sol"' },
        { status: 400 }
      );
    }

    try {
      // Get the singleton connection
      const conn = getConnection();

      // Resolve the domain
      const { pubkey } = getDomainKeySync(cleanDomain);
      const nameRegistry = await NameRegistryState.retrieve(conn, pubkey);
      const ownerAddress = nameRegistry.registry.owner.toBase58();

      if (!ownerAddress) {
        return NextResponse.json(
          { error: 'Failed to resolve domain' },
          { status: 400 }
        );
      }

      // Return the resolved wallet address
      return NextResponse.json({ address: ownerAddress });
    } catch (connError) {
      // If we get a connection error, reset the connection for the next request
      if (
        connError instanceof Error &&
        (connError.message.includes('failed to fetch') ||
          connError.message.includes('timeout') ||
          connError.message.includes('rate limit'))
      ) {
        connection = null;
        console.warn(
          'Resetting Solana connection due to error:',
          connError.message
        );
      }
      throw connError;
    }
  } catch (error) {
    console.error('Error resolving SNS domain:', error);

    // Handle specific errors
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const isNotFound = errorMessage.includes('Account does not exist');

    return NextResponse.json(
      {
        error: isNotFound
          ? 'Domain not found or not registered'
          : `Resolution error: ${errorMessage}`,
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
