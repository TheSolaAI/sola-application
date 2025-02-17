type GoatIndexProjectCount = {
  latest: number;
  previous24Hours: number;
};

type GoatIndexGraphData = {
  date: string;
  value: number;
};

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
