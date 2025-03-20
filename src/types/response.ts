import { AIVoice } from '@/config/ai';
import { Theme } from '@/store/ThemeManager';

export interface UserSettingsResponse {
  id: number;
  user_id: number;
  name: string;
  profile_pic: {
    color: string;
    initials: string;
  };
  theme: string;
  voice_preference: AIVoice;
  emotion_choice: string;
  credits_remaining: number;
  tiers: string;
  custom_themes: Theme[];
}

export interface ChatRoomResponse {
  id: number;
  name: string;
  agent_id: number;
  user: number;
}

export interface ChatMessagesResponse {
  count: number;
  next: string;
  previous: string;
  results: ChatMessageResponseWrapper[];
}

export interface ChatMessageResponseWrapper {
  id: number;
  message: string; // this is JSON string of our ChatContent
  created_at: string;
}

export interface OpenAIKeyGenResponse {
  client_secret: {
    value: string;
    expires_at: number;
  };
}

export interface TokenExtensions {
  coingeckoId: string;
  website: string;
  telegram: string | null;
  twitter: string;
  description: string;
  discord: string;
}

export interface TokenDataResponse {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  marketCap: number;
  fdv: number;
  extensions: TokenExtensions;
  logoURI: string;
  liquidity: number;
  price: number;
  priceChange30mPercent: number;
  priceChange1hPercent: number;
  priceChange4hPercent: number;
  priceChange24hPercent: number;
  uniqueWallet30m: number;
  uniqueWallet1h: number;
  uniqueWallet4h: number;
  uniqueWallet24h: number;
  holder: number;
  sell30m: number;
  buy30m: number;
  vBuy30mUSD: number;
  vSell30mUSD: number;
  sell1h: number;
  buy1h: number;
  vBuy1hUSD: number;
  vSell1hUSD: number;
  sell4h: number;
  buy4h: number;
  vBuy4hUSD: number;
  vSell4hUSD: number;
  sell24h: number;
  buy24h: number;
  vBuy24hUSD: number;
  vSell24hUSD: number;
}
