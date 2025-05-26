export interface InvestmentType {
  description: string;
  types?: {
    [key: string]: {
      description: string;
    };
  };
  toolsets: string[];
}

// Type that includes toolsets
export type InvestmentTypeWithToolsets = InvestmentType;

// Type that excludes toolsets
export type InvestmentTypeWithoutToolsets = Omit<InvestmentType, 'toolsets'>;

export interface InvestmentTypes {
  [key: string]: InvestmentType;
}

export const AVAILABLE_INVESTMENT_TYPES: InvestmentTypes = {
  Staking: {
    description:
      'Staking is the process of locking up a token to earn rewards. It is a way to earn passive income by holding a token.',
    types: {
      'Native Staking': {
        description:
          'You delegate your SOL to a validator, and in return, you get a share of the rewards that validator earns for processing transactions and producing blocks.\n' +
          '- APY sources:\n' +
          "  1. **Validator Staking Rewards** – Validators earn rewards from Solana's inflation schedule and distribute them proportionally to their stakers.\n" +
          '  2. **MEV JITO Rewards** – Validators using the JITO client can earn extra rewards from processing MEV bundles.',
      },
    },
    toolsets: ['staking'],
  },
};

export const InvestementTypeLifecycles: Record<string, string> = {
  Staking: `
            Staking is the process of locking up SOL to help secure the Solana network and earn rewards. The general lifecycle includes the following stages:

            1. **Validator Selection**: The user chooses a validator to delegate their SOL to. Validators are responsible for validating transactions and securing the network.

            2. **Staking (Delegation)**: The user delegates a certain amount of SOL to the chosen validator. This creates a new stake account, and the SOL enters a warm-up period (activation), typically taking one full epoch (~2-3 days).

            3. **Active Staking**: Once the stake is fully activated, it starts earning rewards based on the validator's performance and commission rate. The staked SOL remains locked but accrues staking rewards over time.

            4. **Unstaking (Deactivation)**: The user can choose to unstake (deactivate) their staked SOL. This begins a cool-down period (deactivation) during which the SOL is still locked and not yet available for withdrawal. This also takes approximately one epoch.

            5. **Withdrawable**: After the deactivation period ends, the stake becomes fully inactive, and the SOL is now eligible for withdrawal.

            6. **Withdrawal**: The user can withdraw the unstaked SOL back into their main wallet. Once withdrawn, the stake account can be reused or closed.

            Throughout this lifecycle, the SOL is non-transferable until fully withdrawn. Users can stake, monitor, unstake, and withdraw at any time, respecting the activation and deactivation epochs.
            `,
};
