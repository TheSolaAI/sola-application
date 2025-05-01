export interface UserTierStatus {
  active: boolean;
  tier: number;
  usageLimitUSD: number;
  percentageUsed: number;
}
