interface TokenBalance {
    balance: number;
    mint: string;
    usdValue: number;
}

interface DepositTransaction {
    protocol: string;
    totalDeposit: number;
    transaction: string;
}

interface WithdrawTransaction {
    protocol: string;
    transaction: string;
}

export type AssetsParams = {
    owner: string;

};

export type AssetsResponse = {
    depositValue: number;
    interestEarned: number;
    tokenBalance: TokenBalance[];
    totalValue: number
}

export type DepositParams = {
    owner: string;
    depositAmount: number;
    mintAddress: string;
};

export type DepositResponse = {
    transaction: DepositTransaction[][]
};

export type WithdrawParams = {
    owner: string;
    amount: number;
    mint: string;
    withdraw_all: boolean;
};

export type WithdrawResponse = {
    transaction: WithdrawTransaction[][]
};


