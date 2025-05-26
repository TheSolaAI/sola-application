import { NextResponse } from 'next/server';
import {
  Connection,
  PublicKey,
  ParsedAccountData,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

interface StakeAccountResponse {
  data: {
    pubkey: string;
    lamports: number;
    validator: string | null;
    state: 'active' | 'activating' | 'deactivating' | 'inactive';
    activationEpoch: number | null;
    deactivationEpoch: number | null;
    stake: number;
    rentExemptReserve: number;
    currentEpoch: number;
    epochsUntilActive?: number;
    epochsUntilInactive?: number;
    estimatedTimeUntilActive?: number; // in seconds
    estimatedTimeUntilInactive?: number; // in seconds
    withdrawableAmount: number;
    isReadyForWithdrawal: boolean;
  };
}

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = await params;
    if (!address) {
      return NextResponse.json(
        { error: 'Stake account address is required' },
        { status: 400 }
      );
    }

    const rpc =
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc, {
      commitment: 'confirmed',
      disableRetryOnRateLimit: false,
    });

    let stakeAccountPubkey: PublicKey;
    try {
      stakeAccountPubkey = new PublicKey(address);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid stake account address format' },
        { status: 400 }
      );
    }

    const accountInfo =
      await connection.getParsedAccountInfo(stakeAccountPubkey);

    if (!accountInfo.value) {
      return NextResponse.json(
        { error: 'Stake account not found' },
        { status: 404 }
      );
    }

    const parsedData = accountInfo.value.data as ParsedAccountData;
    const info = parsedData.parsed.info;
    const stakeInfo = info.stake;
    const delegation = stakeInfo?.delegation;

    const currentSlot = await connection.getSlot('finalized');
    const epochInfo = await connection.getEpochInfo();
    const slotsPerEpoch = epochInfo.slotsInEpoch;
    const currentEpoch = epochInfo.epoch;

    const firstSlotOfCurrentEpoch = currentSlot - (epochInfo.slotIndex ?? 0);
    const firstSlotOfPreviousEpoch = firstSlotOfCurrentEpoch - slotsPerEpoch;

    let secondsPerEpoch = 172800; // Default to 2 days

    const [startTime, endTime] = await Promise.all([
      connection.getBlockTime(firstSlotOfPreviousEpoch),
      connection.getBlockTime(firstSlotOfCurrentEpoch),
    ]);

    if (startTime && endTime) {
      secondsPerEpoch = endTime - startTime;
    }

    const U64_MAX = '18446744073709551615';

    let state: StakeAccountResponse['data']['state'] = 'inactive';
    let activationEpoch: number | null = null;
    let deactivationEpoch: number | null = null;
    let epochsUntilActive: number | undefined;
    let epochsUntilInactive: number | undefined;
    let estimatedTimeUntilActive: number | undefined;
    let estimatedTimeUntilInactive: number | undefined;
    let withdrawableAmount = 0;
    let isReadyForWithdrawal = false;

    if (delegation) {
      activationEpoch = Number(delegation.activationEpoch);
      deactivationEpoch =
        delegation.deactivationEpoch === U64_MAX
          ? null
          : Number(delegation.deactivationEpoch);

      if (currentEpoch < activationEpoch) {
        state = 'activating';
        epochsUntilActive = activationEpoch - currentEpoch;
        estimatedTimeUntilActive = epochsUntilActive * secondsPerEpoch;
      } else if (
        deactivationEpoch !== null &&
        currentEpoch < deactivationEpoch
      ) {
        state = 'deactivating';
        epochsUntilInactive = deactivationEpoch - currentEpoch;
        estimatedTimeUntilInactive = epochsUntilInactive * secondsPerEpoch;
      } else if (
        deactivationEpoch === null ||
        currentEpoch >= deactivationEpoch
      ) {
        if (deactivationEpoch !== null && currentEpoch >= deactivationEpoch) {
          state = 'inactive';
          isReadyForWithdrawal = true;
        } else {
          state = 'active';
        }
      }
    }

    // Calculate withdrawable amount based on state
    if (state === 'active' || state === 'inactive') {
      withdrawableAmount = Number(delegation?.stake || 0) / LAMPORTS_PER_SOL;
    }

    const response: StakeAccountResponse = {
      data: {
        pubkey: stakeAccountPubkey.toBase58(),
        lamports: accountInfo.value.lamports,
        validator: delegation?.voter || null,
        state,
        activationEpoch,
        deactivationEpoch,
        stake: delegation?.stake
          ? Number(delegation.stake) / LAMPORTS_PER_SOL
          : 0,
        rentExemptReserve: info.meta?.rentExemptReserve
          ? Number(info.meta.rentExemptReserve) / LAMPORTS_PER_SOL
          : 0,
        currentEpoch,
        epochsUntilActive,
        epochsUntilInactive,
        estimatedTimeUntilActive,
        estimatedTimeUntilInactive,
        withdrawableAmount,
        isReadyForWithdrawal,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching stake account:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: 'Failed to fetch stake account', message: errorMessage },
      { status: 500 }
    );
  }
}
