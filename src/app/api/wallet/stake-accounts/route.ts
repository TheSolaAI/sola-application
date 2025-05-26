import { NextResponse } from 'next/server';
import {
  Connection,
  PublicKey,
  ParsedAccountData,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

interface StakeAccountInfo {
  pubkey: string;
  lamports: number;
  validator: string | null;
  state: string;
  epoch: number;
}

export async function GET(req: Request) {
  try {
    // Get the address from query parameters
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Initialize Solana connection
    const rpc =
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc, {
      commitment: 'confirmed',
      disableRetryOnRateLimit: false,
    });

    let walletPubkey: PublicKey;
    try {
      walletPubkey = new PublicKey(address);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Fetch current epoch info
    const epochInfo = await connection.getEpochInfo();
    const currentEpoch = epochInfo.epoch;

    // Fetch all stake accounts for the wallet
    const stakeAccounts = await connection.getParsedProgramAccounts(
      new PublicKey('Stake11111111111111111111111111111111111111'),
      {
        filters: [
          {
            memcmp: {
              offset: 44, // Offset to the withdrawer/staker field
              bytes: walletPubkey.toBase58(),
            },
          },
        ],
      }
    );

    const U64_MAX = '18446744073709551615';

    // Process and format the stake accounts
    const formattedAccounts: StakeAccountInfo[] = stakeAccounts.map(
      (account) => {
        const parsedData = account.account.data as ParsedAccountData;
        const info = parsedData.parsed.info;
        const stakeInfo = info.stake;
        const delegation = stakeInfo?.delegation;

        let state = 'inactive';
        let activationEpoch = 0;

        if (delegation) {
          activationEpoch = Number(delegation.activationEpoch);
          const deactivationEpoch = delegation.deactivationEpoch;

          if (currentEpoch < activationEpoch) {
            state = 'activating';
          } else if (
            deactivationEpoch !== null &&
            deactivationEpoch !== U64_MAX &&
            Number(deactivationEpoch) <= currentEpoch
          ) {
            state = 'deactivating';
          } else {
            state = 'active';
          }
        }

        return {
          pubkey: account.pubkey.toBase58(),
          lamports: account.account.lamports,
          validator: delegation?.voter || null,
          state,
          epoch: activationEpoch,
        };
      }
    );

    return NextResponse.json({
      accounts: formattedAccounts,
      total: formattedAccounts.length,
      totalStaked: formattedAccounts.reduce(
        (sum, acc) => sum + acc.lamports / LAMPORTS_PER_SOL,
        0
      ),
    });
  } catch (error) {
    console.error('Error fetching stake accounts:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: 'Failed to fetch stake accounts', message: errorMessage },
      { status: 500 }
    );
  }
}
