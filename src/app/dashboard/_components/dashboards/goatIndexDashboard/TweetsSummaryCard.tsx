'use client';

import { FC, useState, useMemo } from 'react';
import { Tweet } from '@/types/goatIndex';
import useThemeManager from '@/store/ThemeManager';
import { formatNumber } from '@/utils/formatNumber';
import { Pill } from '@/components/common/Pill';
import { FiActivity } from 'react-icons/fi';
import { HiOutlineEye } from 'react-icons/hi2';
import { LuHeart, LuMessageCircle, LuRedo2, LuX } from 'react-icons/lu';

interface TweetsSummaryCardProps {
  tweets?: Tweet[];
}

export const TweetsSummaryCard: FC<TweetsSummaryCardProps> = ({
  tweets = [],
}) => {
  const { theme } = useThemeManager();
  const [sortCriteria, setSortCriteria] = useState<'engagement' | 'date'>(
    'engagement'
  );

  // Format timestamp to a readable format, handling milliseconds
  const formatDate = (timestamp: string | number) => {
    // Convert string to number if it's a string
    const timeValue =
      typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const date = new Date(timeValue);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort tweets based on the selected criteria
  const sortedTweets = useMemo(() => {
    if (!tweets || tweets.length === 0) return [];

    return [...tweets].sort((a, b) => {
      if (sortCriteria === 'engagement') {
        return b.engagement - a.engagement;
      } else {
        // Convert timestamps to numbers for comparison
        const timeA =
          typeof a.sendTimestamp === 'string'
            ? parseInt(a.sendTimestamp, 10)
            : a.sendTimestamp;

        const timeB =
          typeof b.sendTimestamp === 'string'
            ? parseInt(b.sendTimestamp, 10)
            : b.sendTimestamp;

        return timeB - timeA;
      }
    });
  }, [tweets, sortCriteria]);

  // Find top tweet by engagement
  const topTweet = useMemo(() => {
    if (!sortedTweets || sortedTweets.length === 0) return null;
    return sortedTweets[0];
  }, [sortedTweets]);

  // Calculate engagement score as percentage of the top tweet
  const getEngagementPercentage = (engagement: number) => {
    if (!topTweet) return 0;
    return (engagement / topTweet.engagement) * 100;
  };

  // Truncate content if it's too long
  const truncateContent = (content: string, maxLength: number = 180) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-background rounded-xl w-full flex flex-col p-4">
      <div className="flex flex-row items-center justify-between mb-6">
        {/* Header */}
        <h1 className="text-textColor text-2xl font-semibold">Top Tweets</h1>
        <div className="flex flex-row gap-x-2 flex-wrap">
          <Pill
            text="Price"
            color={
              sortCriteria === 'engagement'
                ? theme.primaryDark
                : theme.sec_background
            }
            textColor={sortCriteria === 'engagement' ? 'white' : theme.secText}
            onClick={() => setSortCriteria('engagement')}
            hoverable={true}
          />
          <Pill
            text="Date"
            color={
              sortCriteria === 'date' ? theme.primaryDark : theme.sec_background
            }
            textColor={sortCriteria === 'date' ? 'white' : theme.secText}
            onClick={() => setSortCriteria('date')}
            hoverable={true}
          />
        </div>
      </div>

      {/* Flexbox layout for tweets */}
      <div className="flex flex-wrap gap-4 justify-center">
        {topTweet && (
          <div
            className="p-5 rounded-xl border-2 flex-grow"
            style={{
              borderColor: theme.primaryDark,
              backgroundColor: `${theme.sec_background}30`,
            }}
          >
            <div className="flex items-start gap-4">
              <img
                src={topTweet.senderProfileImage}
                alt={topTweet.senderName}
                className="w-14 h-14 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/56/56';
                }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-textColor text-lg">
                      {topTweet.senderName}
                    </p>
                    <p className="text-secText text-sm">
                      @{topTweet.senderUsername}
                    </p>
                  </div>
                  <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold">
                    Top Tweet
                  </span>
                </div>
                <p className="my-4 text-textColor text-base leading-relaxed">
                  {topTweet.content}
                </p>
                <p className="text-secText text-sm">
                  {formatDate(topTweet.sendTimestamp)}
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-5 border-t border-secText pt-4">
              <div className="flex items-center gap-2">
                <FiActivity className="text-secText" />
                <span className="text-secText">
                  {formatNumber(topTweet.engagement)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineEye className="text-secText" />
                <span className="text-secText">
                  {formatNumber(topTweet.views)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LuMessageCircle className="text-secText" />
                <span className="text-secText">
                  {formatNumber(topTweet.reply)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LuRedo2 className="text-secText" />
                <span className="text-secText">
                  {formatNumber(topTweet.repost)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LuHeart className="text-secText" />
                <span className="text-secText">
                  {formatNumber(topTweet.like)}
                </span>
              </div>
            </div>

            <a
              href={topTweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-4 py-2 px-4 bg-sec_background text-textColor rounded-lg hover:bg-secText hover:text-white transition-all text-center font-medium"
            >
              View Original Tweet
            </a>
          </div>
        )}

        {/* Regular tweets */}
        {sortedTweets.slice(1).map((tweet, index) => (
          <div
            key={tweet.url}
            className="bg-sec_background rounded-lg p-4 relative overflow-hidden w-80 flex-grow max-w-md"
          >
            {/* Engagement percentage bar */}
            <div
              className="absolute left-0 top-0 h-1"
              style={{
                width: `${getEngagementPercentage(tweet.engagement)}%`,
                backgroundColor: theme.primaryDark,
              }}
            />

            <div className="flex gap-3">
              <img
                src={tweet.senderProfileImage}
                alt={tweet.senderName}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/48/48';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="truncate pr-2">
                    <p className="font-medium text-textColor truncate text-base">
                      {tweet.senderName}
                    </p>
                    <p className="text-secText text-sm truncate">
                      @{tweet.senderUsername}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-secText shrink-0">
                    <FiActivity size={16} />
                    <span className="text-sm">
                      {formatNumber(tweet.engagement)}
                    </span>
                  </div>
                </div>

                {/* Fixed height content area with ellipsis overflow */}
                <div className="my-3 h-20 overflow-hidden">
                  <p className="text-textColor text-base leading-relaxed">
                    {truncateContent(tweet.content)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-secText mt-3">
              <span>{formatDate(tweet.sendTimestamp)}</span>
              <div className="flex gap-3 flex-wrap justify-end">
                <div className="flex items-center gap-1">
                  <LuMessageCircle size={14} />
                  {formatNumber(tweet.reply)}
                </div>
                <div className="flex items-center gap-1">
                  <LuRedo2 size={14} />
                  {formatNumber(tweet.repost)}
                </div>
                <div className="flex items-center gap-1">
                  <LuHeart size={14} />
                  {formatNumber(tweet.like)}
                </div>
              </div>
            </div>

            <a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-4 py-2 px-3 bg-background text-textColor rounded-lg hover:bg-primaryDark hover:text-white transition-all text-center font-medium"
            >
              View Original Tweet
            </a>
          </div>
        ))}

        {/* Empty state */}
        {sortedTweets.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center py-16 text-secText">
            <LuX size={48} className="text-secText" />
            <p className="mt-5 text-xl">No tweets available</p>
          </div>
        )}
      </div>
    </div>
  );
};
