'use client';

import { FC, useState, useMemo } from 'react';
import { Tweet } from '@/types/goatIndex';
import useThemeManager from '@/store/ThemeManager';
import { formatNumber } from '@/utils/formatNumber';
import { Pill } from '@/components/common/Pill';
import { FiActivity } from 'react-icons/fi';
import { HiOutlineEye } from 'react-icons/hi2';
import {
  LuHeart,
  LuMessageCircle,
  LuRedo2,
  LuX,
  LuExternalLink,
} from 'react-icons/lu';
import Image from 'next/image';

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
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex my-1 justify-start w-full transition-opacity duration-500">
      <div className="overflow-hidden rounded-xl bg-background shadow-lg w-full">
        {/* Header with sorting options */}
        <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <h2 className="text-lg font-semibold text-textColor">Top Tweets</h2>
          <div className="flex flex-row gap-x-2 flex-wrap">
            <Pill
              text="Engagement"
              color={
                sortCriteria === 'engagement'
                  ? theme.primaryDark
                  : theme.sec_background
              }
              textColor={
                sortCriteria === 'engagement' ? 'white' : theme.secText
              }
              onClick={() => setSortCriteria('engagement')}
              hoverable={true}
            />
            <Pill
              text="Date"
              color={
                sortCriteria === 'date'
                  ? theme.primaryDark
                  : theme.sec_background
              }
              textColor={sortCriteria === 'date' ? 'white' : theme.secText}
              onClick={() => setSortCriteria('date')}
              hoverable={true}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Top Tweet */}
          {topTweet && (
            <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow mb-4">
              {/* Top Tweet Header */}
              <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Image
                    src={topTweet.senderProfileImage}
                    alt={topTweet.senderName}
                    className="rounded-full object-cover"
                    width={48}
                    height={48}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/48/48';
                    }}
                  />
                  <div>
                    <p className="font-semibold text-textColor">
                      {topTweet.senderName}
                    </p>
                    <p className="text-secText text-sm">
                      @{topTweet.senderUsername}
                    </p>
                  </div>
                </div>
                <span className="bg-primary text-white px-2 py-1 rounded-lg text-xs font-bold">
                  Top Tweet
                </span>
              </div>

              {/* Tweet Content */}
              <div className="px-4 py-3">
                <p className="text-textColor mb-3">{topTweet.content}</p>
                <p className="text-secText text-sm">
                  {formatDate(topTweet.sendTimestamp)}
                </p>
              </div>

              {/* Engagement Stats */}
              <div className="px-4 py-3 bg-surface/20 border-t border-border">
                <div className="grid grid-cols-5 gap-2">
                  <div className="flex items-center gap-1 text-secText">
                    <FiActivity size={16} />
                    <span>{formatNumber(topTweet.engagement)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-secText">
                    <HiOutlineEye size={16} />
                    <span>{formatNumber(topTweet.views)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-secText">
                    <LuMessageCircle size={16} />
                    <span>{formatNumber(topTweet.reply)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-secText">
                    <LuRedo2 size={16} />
                    <span>{formatNumber(topTweet.repost)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-secText">
                    <LuHeart size={16} />
                    <span>{formatNumber(topTweet.like)}</span>
                  </div>
                </div>
              </div>

              {/* View Original Button */}
              <div className="px-4 py-3 border-t border-border">
                <a
                  href={topTweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-2 bg-surface/30 text-textColor rounded-lg hover:bg-primaryDark hover:text-white transition-all text-sm font-medium gap-2"
                >
                  View Original Tweet
                  <LuExternalLink size={16} />
                </a>
              </div>
            </div>
          )}

          {/* Regular tweets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTweets.slice(1).map((tweet) => (
              <div
                key={tweet.url}
                className="overflow-hidden rounded-xl bg-sec_background border border-border shadow relative"
              >
                {/* Engagement percentage bar */}
                <div
                  className="absolute left-0 top-0 h-1"
                  style={{
                    width: `${getEngagementPercentage(tweet.engagement)}%`,
                    backgroundColor: theme.primaryDark,
                  }}
                />

                {/* Tweet Header */}
                <div className="px-3 py-2 border-b border-border flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Image
                      src={tweet.senderProfileImage}
                      alt={tweet.senderName}
                      className="rounded-full object-cover"
                      width={36}
                      height={36}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/36/36';
                      }}
                    />
                    <div className="truncate">
                      <p className="font-medium text-textColor truncate text-sm">
                        {tweet.senderName}
                      </p>
                      <p className="text-secText text-xs truncate">
                        @{tweet.senderUsername}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-secText text-xs shrink-0">
                    <FiActivity size={14} />
                    <span>{formatNumber(tweet.engagement)}</span>
                  </div>
                </div>

                {/* Tweet Content */}
                <div className="px-3 py-2 h-20 overflow-hidden">
                  <p className="text-textColor text-sm">
                    {truncateContent(tweet.content)}
                  </p>
                </div>

                {/* Tweet Stats */}
                <div className="px-3 py-2 bg-surface/20 border-t border-border flex justify-between text-xs text-secText">
                  <span>{formatDate(tweet.sendTimestamp)}</span>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                      <LuMessageCircle size={12} />
                      {formatNumber(tweet.reply)}
                    </div>
                    <div className="flex items-center gap-1">
                      <LuRedo2 size={12} />
                      {formatNumber(tweet.repost)}
                    </div>
                    <div className="flex items-center gap-1">
                      <LuHeart size={12} />
                      {formatNumber(tweet.like)}
                    </div>
                  </div>
                </div>

                {/* View Button */}
                <div className="px-3 py-2 border-t border-border">
                  <a
                    href={tweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2 bg-surface/30 text-textColor rounded-lg hover:bg-primaryDark hover:text-white transition-all text-xs font-medium gap-1"
                  >
                    View Original Tweet
                    <LuExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {sortedTweets.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center py-16 text-secText">
              <LuX size={48} className="text-secText" />
              <p className="mt-4 text-lg">No tweets available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
