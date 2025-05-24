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
