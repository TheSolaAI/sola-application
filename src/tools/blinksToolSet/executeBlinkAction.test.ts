import {
  buildParameterizedActionUrl,
  resolveBlinkActionUrl,
  selectMatchingBlinkAction,
} from './executeBlinkAction';
import { BlinkActionMetadata } from '@/types/blinks';

const SAMPLE_METADATA: BlinkActionMetadata = {
  title: 'Swap SOL to SOLA',
  icon: 'https://solaai.xyz/icon.png',
  description: 'Instant Solana Blink swap action',
  label: 'Swap Now',
  links: {
    actions: [
      { label: 'Buy 1 SOLA', href: '/api/actions/swap?amount=1' },
      {
        label: 'Custom Swap',
        href: '/api/actions/swap?amount={amount}&slippage={slippage}',
        parameters: [
          { name: 'amount', label: 'Amount', required: true },
          { name: 'slippage', label: 'Slippage BPS', required: false },
        ],
      },
    ],
  },
};

export function runBlinkActionUnitSuite(): void {
  const unwrappedAction = resolveBlinkActionUrl({
    actionUrl:
      'https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fsolaai.xyz%2Fapi%2Factions%2Fswap',
  });
  if (unwrappedAction !== 'https://solaai.xyz/api/actions/swap') {
    throw new Error(`Unexpected unwrapped URL: ${unwrappedAction}`);
  }

  const parameterizedUrl = buildParameterizedActionUrl({
    baseActionUrl: 'https://solaai.xyz/api/actions/swap',
    href: '/api/actions/swap?amount={amount}&slippage={slippage}',
    parameters: { amount: 25, slippage: 50 },
  });
  if (
    parameterizedUrl !==
    'https://solaai.xyz/api/actions/swap?amount=25&slippage=50'
  ) {
    throw new Error(`Unexpected parameterized URL: ${parameterizedUrl}`);
  }

  const matchedByLabel = selectMatchingBlinkAction(SAMPLE_METADATA, {
    actionLabel: 'custom swap',
  });
  if (matchedByLabel?.label !== 'Custom Swap') {
    throw new Error('Failed to match Blink action by case-insensitive label');
  }
}
