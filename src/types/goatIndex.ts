export type GraphPoint = {
  date: string;
  value: number;
};

export type GoatIndexProjectCount = {
  latest: number;
  previous24Hours: number;
};

type GoatIndexGraphData = GraphPoint;

export interface Tweet {
  engagement: number;
  url: string;
  senderProfileImage: string;
  senderName: string;
  senderUsername: string;
  sendTimestamp: string;
  content: string;
  views: number;
  repost: number;
  like: number;
  reply: number;
}

export interface Metrics {
  price: number;
  marketCap: number;
  liquidity: number;
  tradingVolume: number;
  holders: number;
  mindShare: number;
  avgImpressions: number;
  avgEngagement: number;
  followers: number;
}

interface DeltaMetrics {
  delta: {
    priceDelta: number;
    marketCapDelta: number;
    tradingVolumeDelta: number;
    holdersDelta: number;
    mindShareDelta: number;
    impressionsDelta: number;
    engagementDelta: number;
    liquidityDelta: number;
    followersDelta: number;
  };
  previous: Metrics;
  latest: Metrics;
}

interface SimilarProject {
  tokenId: string;
  chain: string;
  contractAddress: string;
  name: string;
  symbol: string;
  image: string;
  category: string;
  marketCap: number;
  mindShare: number;
  difference: number;
  marketCapGraphs: GraphPoint[];
  mindShareGraphs: GraphPoint[];
}

interface SimilarProjects {
  similarProjectsByMarketCap: SimilarProject[];
  similarProjectsByMindShare: SimilarProject[];
}

export type GoatIndexTokenData = {
  id: string;
  chain: string;
  contractAddress: string;
  name: string;
  symbol: string;
  image: string;
  twitter: string;
  status: string;
  mindShare: number;
  priceDelta: number;
  mindShareDelta: number;
};

export type GoatIndexTopAiProjectsApiResponse = {
  data: {
    projectsCount: GoatIndexProjectCount;
    hasTokenCountGraphs: GoatIndexGraphData[];
    totalMarketCapGraphs: GoatIndexGraphData[];
    tradingVolumeGraphs: GoatIndexGraphData[];
    topTokensOrderByMindShareIn6h: GoatIndexTokenData[];
    topTokensOrderByMindShareIn1d: GoatIndexTokenData[];
    topTokensOrderByMindShareIn7d: GoatIndexTokenData[];
    topTokensOrderByMindShareDeltaIn6h: GoatIndexTokenData[];
    topTokensOrderByMindShareDeltaIn1d: GoatIndexTokenData[];
    topTokensOrderByPriceDeltaIn6h: GoatIndexTokenData[];
    topTokensOrderByPriceDeltaIn1d: GoatIndexTokenData[];
    newProjects: string[];
  };
};

export interface GithubAnalysis {
  score: number;
  contributors: number;
  stars: number;
  forks: number;
  age: string;
  communityHealthScore: number;
  engagementScore: number;
  documentationScore: number;
  codeQualityScore: number;
  codeConsistencyScore: number;
  codeBestPracticesScore: number;
}

export interface AgentTokenDetail {
  id: string;
  chain: string;
  contractAddress: string;
  name: string;
  symbol: string;
  image: string;
  creationTime: string;
  description: string;
  labels: string[];
  category: string;
  twitter: string;
  devTwitter: string;
  devDoxxed: boolean;
  telegram: string;
  website: string;
  github: string;
  framework: string;
  warning: string;
  status: string;
  githubScore: string;
  githubAnalysis: GithubAnalysis;
  mindShare: number;
  totalConversations: number;
  priceDelta: number;
  mindShareDelta: number;
  isInWatchList: boolean;
}

export interface GoatIndexAgentResponse {
  data: {
    agentDetail: {
      tokenDetail: AgentTokenDetail;
      topTweets: Tweet[];
      metrics: Metrics;
      deltaMetrics: DeltaMetrics;
      priceGraphs: GraphPoint[];
      mindshareGraphs: GraphPoint[];
      marketCapGraphs: GraphPoint[];
      mentionTweets: Tweet[];
      similarProjects: SimilarProjects;
    };
  };
}

export interface AIProjectRankingResult {
  tokenDetail: AgentTokenDetail;
  topTweets: Tweet[];
  metrics: Metrics;
  deltaMetrics: DeltaMetrics;
}

export interface AIProjectRankingApiResponse {
  data: {
    data: AIProjectRankingResult[];
    total: number;
    currentPage: number;
    totalPage: number;
  };
}
