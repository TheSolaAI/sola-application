export type GraphPoint = {
  date: string;
  value: number;
};

type GoatIndexProjectCount = {
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
  chain: string; // doesnt matter
  contractAddress: string;
  name: string; // done
  symbol: string;
  image: string; // done
  creationTime: string; // ignored
  description: string; // done
  labels: { name: string }[]; // done
  category: string; // done
  twitter: string; // done
  devTwitter: string; // done
  devDoxxed: boolean; // done
  telegram: string; // done
  website: string; // done
  github: string; // done
  framework: string; // useless
  warning: string; // useless
  status: string; // useless
  githubScore: string;
  githubAnalysis: GithubAnalysis; // done
  mindShare: number; // done
  totalConversations: number; // done
  priceDelta: number; // done
  mindShareDelta: number; // done
  isInWatchList: boolean; // done
}

export interface GoatIndexAgentResponse {
  data: {
    agentDetail: {
      tokenDetail: AgentTokenDetail;
      topTweets: Tweet[];
      metrics: Metrics; // done
      deltaMetrics: DeltaMetrics; // useless
      priceGraphs: GraphPoint[]; // done
      mindshareGraphs: GraphPoint[]; // done
      marketCapGraphs: GraphPoint[]; // done
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
