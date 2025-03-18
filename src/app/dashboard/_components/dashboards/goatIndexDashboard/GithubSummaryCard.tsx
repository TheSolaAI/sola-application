'use client';

import { FC } from 'react';
import { GithubAnalysis } from '@/types/goatIndex';
import useThemeManager from '@/store/ThemeManager';
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
    <div className="bg-background rounded-xl w-full flex flex-col p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* GitHub Stats Summary Column */}
        <div className="flex flex-col gap-y-3 md:w-2/5">
          <h1 className="text-textColor text-2xl font-semibold">
            GitHub Analysis
          </h1>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Overall Score</p>
              <p className="text-textColor text-2xl font-bold">
                {stats.score ? `${stats.score}/100` : 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Stars</p>
              <p className="text-textColor text-2xl font-bold">
                {stats.stars?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Forks</p>
              <p className="text-textColor text-2xl font-bold">
                {stats.forks?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3">
              <p className="text-secText text-sm">Contributors</p>
              <p className="text-textColor text-2xl font-bold">
                {stats.contributors?.toLocaleString() || 'N/A'}
              </p>
            </div>

            <div className="bg-sec_background rounded-lg p-3 col-span-2">
              <p className="text-secText text-sm">Repository Age</p>
              <p className="text-textColor text-2xl font-bold">
                {stats.age || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Radar Chart Column */}
        <div className="flex flex-col gap-y-3 md:w-3/5">
          <h2 className="text-textColor text-lg font-semibold">
            Repository Health Mindmap
          </h2>

          {/* Chart Area */}
          <div className="flex-grow" style={{ minHeight: '346px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="80%" data={getRadarData()}>
                <PolarGrid stroke={theme.secText} opacity={0.5} />
                <PolarAngleAxis dataKey="category" stroke={theme.secText} />
                <PolarRadiusAxis domain={[0, 100]} stroke={theme.secText} />
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
    </div>
  );
};
