'use client';

import { FC, useState, useEffect } from 'react';
import { GithubAnalysis } from '@/types/goatIndex';
import useThemeManager from '@/store/ThemeManager';
import { MaskedRevealLoader } from '@/components/common/MaskedRevealLoader';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

interface GithubSummaryCardProps {
  stats?: GithubAnalysis;
}

export const GithubSummaryCard: FC<GithubSummaryCardProps> = ({ stats }) => {
  const { theme } = useThemeManager();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (stats) {
      setLoading(false);
    }
  }, [stats]);

  /**
   * Some repositories may not have Github stats available, so in that case we return null.
   */
  if (!stats) {
    return null;
  }

  /**
   *  Radar Chart Data
   */
  const getRadarData = () => {
    return [
      {
        category: 'Community Health',
        value: stats.communityHealthScore,
        fullMark: 100,
      },
      {
        category: 'Engagement',
        value: stats.engagementScore,
        fullMark: 100,
      },
      {
        category: 'Documentation',
        value: stats.documentationScore,
        fullMark: 100,
      },
      {
        category: 'Code Quality',
        value: stats.codeQualityScore,
        fullMark: 100,
      },
      {
        category: 'Consistency',
        value: stats.codeConsistencyScore,
        fullMark: 100,
      },
      {
        category: 'Best Practices',
        value: stats.codeBestPracticesScore,
        fullMark: 100,
      },
    ];
  };

  // Custom tooltip for radar chart
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: theme.baseBackground,
            border: `1px solid ${theme.sec_background}`,
          }}
        >
          <p className="text-textColor font-semibold">
            {payload[0].payload.category}
          </p>
          <p style={{ color: '#4CAF50' }}>Score: {payload[0].value}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex my-1 justify-start w-full transition-opacity duration-500">
      <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-primary/10">
          <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
            GitHub Analysis
          </h2>
          <span className="text-xs text-secText bg-surface/50 px-2 py-1 rounded">
            Score: {stats.score ? `${stats.score}/100` : 'N/A'}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <MaskedRevealLoader isLoading={loading}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* GitHub Stats Summary Column */}
              <div className="flex flex-col gap-y-3 md:w-2/5">
                <div className="grid grid-cols-2 gap-3 flex-1">
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-secText text-sm">Stars</p>
                    <p className="text-textColor text-2xl font-bold">
                      {stats.stars?.toLocaleString() || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-3">
                    <p className="text-secText text-sm">Forks</p>
                    <p className="text-textColor text-2xl font-bold">
                      {stats.forks?.toLocaleString() || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-3">
                    <p className="text-secText text-sm">Contributors</p>
                    <p className="text-textColor text-2xl font-bold">
                      {stats.contributors?.toLocaleString() || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-background rounded-lg p-3">
                    <p className="text-secText text-sm">Repository Age</p>
                    <p className="text-textColor text-2xl font-bold">
                      {stats.age || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Radar Chart Column */}
              <div className="flex flex-col gap-y-3 md:w-3/5">
                <div className="flex-grow" style={{ minHeight: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="80%" data={getRadarData()}>
                      <PolarGrid stroke={theme.secText} opacity={0.5} />
                      <PolarAngleAxis
                        dataKey="category"
                        stroke={theme.secText}
                      />
                      <PolarRadiusAxis
                        domain={[0, 100]}
                        stroke={theme.secText}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#4CAF50"
                        fill="#4CAF50"
                        fillOpacity={0.6}
                      />
                      <Tooltip content={<CustomRadarTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </MaskedRevealLoader>
        </div>

        {/* Footer with explanation */}
        <div className="px-4 py-3 bg-surface/20 border-t border-border">
          <div className="text-xs text-secText">
            <p>
              Repository health analysis displays key metrics across multiple
              dimensions. Higher scores indicate better quality and community
              engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
