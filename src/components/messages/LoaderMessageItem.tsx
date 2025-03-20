'use client';

import { LoaderMessageChatContent } from '@/types/chatItem';
import { FC } from 'react';
import useThemeManager from '@/store/ThemeManager';

interface LoaderMessageItemProps {
  props: LoaderMessageChatContent;
}

export const LoaderMessageItem: FC<LoaderMessageItemProps> = ({ props }) => {
  /**
   * Global State
   */
  const { theme } = useThemeManager();

  return (
    <div className="flex flex-row gap-2 items-center">
      <div className="text-base">
        {props.text.split('').map((char, index) => (
          <span
            key={index}
            className="transition-all duration-700"
            style={{
              color: theme.primary,
              animation:
                char === ' '
                  ? 'none'
                  : `textColorPulse 3s infinite ${index * 0.08}s`,
              whiteSpace: 'pre',
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};
