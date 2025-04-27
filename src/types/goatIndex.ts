import { z } from 'zod';

// Base Types
const GraphPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

const GoatIndexProjectCountSchema = z.object({
  latest: z.number(),
  previous24Hours: z.number(),
});

const TweetSchema = z.object({
  engagement: z.number(),
  url: z.string(),
  senderProfileImage: z.string(),
  senderName: z.string(),
  senderUsername: z.string(),
  sendTimestamp: z.string(),
  content: z.string(),
  views: z.number(),
  repost: z.number(),
  like: z.number(),
  reply: z.number(),
});

const MetricsSchema = z.object({
  price: z.number(),
  marketCap: z.number(),
  liquidity: z.number(),
  tradingVolume: z.number(),
  holders: z.number(),
  mindShare: z.number(),
  avgImpressions: z.number(),
  avgEngagement: z.number(),
  followers: z.number(),
});

const DeltaMetricsSchema = z.object({
  delta: z.object({
    priceDelta: z.number(),
    marketCapDelta: z.number(),
    tradingVolumeDelta: z.number(),
    holdersDelta: z.number(),
    mindShareDelta: z.number(),
    impressionsDelta: z.number(),
    engagementDelta: z.number(),
    liquidityDelta: z.number(),
    followersDelta: z.number(),
  }),
  previous: MetricsSchema,
  latest: MetricsSchema,
});

const SimilarProjectSchema = z.object({
  tokenId: z.string(),
  chain: z.string(),
  contractAddress: z.string(),
  name: z.string(),
  symbol: z.string(),
  image: z.string(),
  category: z.string(),
  marketCap: z.number(),
  mindShare: z.number(),
  difference: z.number(),
  marketCapGraphs: z.array(GraphPointSchema),
  mindShareGraphs: z.array(GraphPointSchema),
});

const SimilarProjectsSchema = z.object({
  similarProjectsByMarketCap: z.array(SimilarProjectSchema),
  similarProjectsByMindShare: z.array(SimilarProjectSchema),
});

const GoatIndexTokenDataSchema = z.object({
  id: z.string(),
  chain: z.string(),
  contractAddress: z.string(),
  name: z.string(),
  symbol: z.string(),
  image: z.string(),
  twitter: z.string(),
  status: z.string(),
  mindShare: z.number(),
  priceDelta: z.number(),
  mindShareDelta: z.number(),
});

const GoatIndexTopAiProjectsApiResponseSchema = z.object({
  data: z.object({
    projectsCount: GoatIndexProjectCountSchema,
    hasTokenCountGraphs: z.array(GraphPointSchema),
    totalMarketCapGraphs: z.array(GraphPointSchema),
    tradingVolumeGraphs: z.array(GraphPointSchema),
    topTokensOrderByMindShareIn6h: z.array(GoatIndexTokenDataSchema),
    topTokensOrderByMindShareIn1d: z.array(GoatIndexTokenDataSchema),
    topTokensOrderByMindShareIn7d: z.array(GoatIndexTokenDataSchema),
    topTokensOrderByMindShareDeltaIn6h: z.array(GoatIndexTokenDataSchema),
    topTokensOrderByMindShareDeltaIn1d: z.array(GoatIndexTokenDataSchema),
    topTokensOrderByPriceDeltaIn6h: z.array(GoatIndexTokenDataSchema),
    topTokensOrderByPriceDeltaIn1d: z.array(GoatIndexTokenDataSchema),
    newProjects: z.array(z.string()),
  }),
});

const GithubAnalysisSchema = z.object({
  score: z.number(),
  contributors: z.number(),
  stars: z.number(),
  forks: z.number(),
  age: z.string(),
  communityHealthScore: z.number(),
  engagementScore: z.number(),
  documentationScore: z.number(),
  codeQualityScore: z.number(),
  codeConsistencyScore: z.number(),
  codeBestPracticesScore: z.number(),
});

const AgentTokenDetailSchema = z.object({
  id: z.string(),
  chain: z.string(),
  contractAddress: z.string(),
  name: z.string(),
  symbol: z.string(),
  image: z.string(),
  creationTime: z.string(),
  description: z.string(),
  labels: z.array(z.string()),
  category: z.string(),
  twitter: z.string(),
  devTwitter: z.string(),
  devDoxxed: z.boolean(),
  telegram: z.string(),
  website: z.string(),
  github: z.string(),
  framework: z.string(),
  warning: z.string(),
  status: z.string(),
  githubScore: z.string(),
  githubAnalysis: GithubAnalysisSchema,
  mindShare: z.number(),
  totalConversations: z.number(),
  priceDelta: z.number(),
  mindShareDelta: z.number(),
  isInWatchList: z.boolean(),
});

const GoatIndexAgentResponseSchema = z.object({
  data: z.object({
    agentDetail: z.object({
      tokenDetail: AgentTokenDetailSchema,
      topTweets: z.array(TweetSchema),
      metrics: MetricsSchema,
      deltaMetrics: DeltaMetricsSchema,
      priceGraphs: z.array(GraphPointSchema),
      mindshareGraphs: z.array(GraphPointSchema),
      marketCapGraphs: z.array(GraphPointSchema),
      mentionTweets: z.array(TweetSchema),
      similarProjects: SimilarProjectsSchema,
    }),
  }),
});

const AIProjectRankingResultSchema = z.object({
  tokenDetail: AgentTokenDetailSchema,
  topTweets: z.array(TweetSchema),
  metrics: MetricsSchema,
  deltaMetrics: DeltaMetricsSchema,
});

const AIProjectRankingApiResponseSchema = z.object({
  data: z.object({
    data: z.array(AIProjectRankingResultSchema),
    total: z.number(),
    currentPage: z.number(),
    totalPage: z.number(),
  }),
});

// Infer TypeScript Types
type GraphPoint = z.infer<typeof GraphPointSchema>;
type GoatIndexProjectCount = z.infer<typeof GoatIndexProjectCountSchema>;
type Tweet = z.infer<typeof TweetSchema>;
type Metrics = z.infer<typeof MetricsSchema>;
type DeltaMetrics = z.infer<typeof DeltaMetricsSchema>;
type SimilarProject = z.infer<typeof SimilarProjectSchema>;
type SimilarProjects = z.infer<typeof SimilarProjectsSchema>;
type GoatIndexTokenData = z.infer<typeof GoatIndexTokenDataSchema>;
type GoatIndexTopAiProjectsApiResponse = z.infer<
  typeof GoatIndexTopAiProjectsApiResponseSchema
>;
type GithubAnalysis = z.infer<typeof GithubAnalysisSchema>;
type AgentTokenDetail = z.infer<typeof AgentTokenDetailSchema>;
type GoatIndexAgentResponse = z.infer<typeof GoatIndexAgentResponseSchema>;
type AIProjectRankingResult = z.infer<typeof AIProjectRankingResultSchema>;
type AIProjectRankingApiResponse = z.infer<
  typeof AIProjectRankingApiResponseSchema
>;

export {
  GraphPointSchema,
  GoatIndexProjectCountSchema,
  TweetSchema,
  MetricsSchema,
  DeltaMetricsSchema,
  SimilarProjectSchema,
  SimilarProjectsSchema,
  GoatIndexTokenDataSchema,
  GoatIndexTopAiProjectsApiResponseSchema,
  GithubAnalysisSchema,
  AgentTokenDetailSchema,
  GoatIndexAgentResponseSchema,
  AIProjectRankingResultSchema,
  AIProjectRankingApiResponseSchema,
};

export type {
  GraphPoint,
  GoatIndexProjectCount,
  Tweet,
  Metrics,
  DeltaMetrics,
  SimilarProject,
  SimilarProjects,
  GoatIndexTokenData,
  GoatIndexTopAiProjectsApiResponse,
  GithubAnalysis,
  AgentTokenDetail,
  GoatIndexAgentResponse,
  AIProjectRankingResult,
  AIProjectRankingApiResponse,
};
