type PriorityFee =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax'
  | 'Custom';

type Slippage = 'Low' | 'Medium' | 'High' | 'Recommended' | 'Custom';

type MevFee = 'Low' | 'Medium' | 'High' | 'Recommended' | 'Custom';

export const PriorityFee: PriorityFee[] = [
  'Min',
  'Low',
  'Medium',
  'High',
  'VeryHigh',
  'UnsafeMax',
  'Custom',
];

export const Slippage: Slippage[] = [
  'Low',
  'Medium',
  'High',
  'Recommended',
  'Custom',
];

export const MevFee: MevFee[] = [
  'Low',
  'Medium',
  'High',
  'Recommended',
  'Custom',
];
