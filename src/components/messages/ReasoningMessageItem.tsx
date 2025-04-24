'use client';

import React, { useState, useEffect } from 'react';
import {
  LuBrain,
  LuChevronDown,
  LuChevronUp,
  LuPlay,
  LuPause,
} from 'react-icons/lu';
import useThemeManager from '@/store/ThemeManager';
import { TypewriterEffect } from '@/components/common/TypewriterEffect';

interface ReasoningMessageItemProps {
  reasoning: string;
}

export const ReasoningMessageItem: React.FC<ReasoningMessageItemProps> = ({
  reasoning,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animate, setAnimate] = useState(true);

  const paragraphs = reasoning.split('\n\n').filter((p) => p.trim().length > 0);

  useEffect(() => {
    if (isExpanded) {
      setAnimate(true);
    }
  }, [isExpanded]);

  return (
    <div className="w-full my-3 animate-in fade-in duration-300">
      <div
        className={`flex flex-col rounded-2xl border ${isExpanded ? 'border-primary border-opacity-50' : 'border-border'} bg-surface shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-md' : ''}`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-between w-full px-4 py-3 hover:bg-sec_background transition-all duration-200 ${isExpanded ? 'bg-sec_background bg-opacity-70' : ''}`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`p-1 rounded-full ${isExpanded ? 'bg-primary bg-opacity-20' : ''} transition-all duration-300`}
            >
              <LuBrain
                size={18}
                className={`${isExpanded ? 'text-primary' : 'text-primaryDark'} ${isExpanded ? 'animate-pulse-slow' : ''}`}
              />
            </div>
            <span
              className={`font-medium text-sm ${isExpanded ? 'text-textColor' : 'text-secText'}`}
            >
              Thinking
            </span>
            {isExpanded && (
              <div className="h-1.5 w-1.5 rounded-full bg-primaryDark animate-pulse-opacity"></div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs ${isExpanded ? 'text-primaryDark' : 'text-secText opacity-70'}`}
            >
              {isExpanded ? 'Hide reasoning' : 'Show reasoning'}
            </span>
            {isExpanded ? (
              <LuChevronUp size={16} className="text-primaryDark" />
            ) : (
              <LuChevronDown size={16} className="text-secText" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 py-3 border-t border-border bg-surface bg-opacity-60">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <span className="text-xs text-primaryDark font-medium mr-2">
                  Step-by-step reasoning
                </span>
                <div className="h-1 w-1 rounded-full bg-primaryDark opacity-40"></div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAnimate(!animate);
                }}
                className="text-xs flex items-center gap-1 text-secText hover:text-primaryDark transition-colors p-1 rounded hover:bg-sec_background"
              >
                {animate ? (
                  <>
                    <LuPause size={12} />
                    <span>Pause animation</span>
                  </>
                ) : (
                  <>
                    <LuPlay size={12} />
                    <span>Animate</span>
                  </>
                )}
              </button>
            </div>

            <div
              className="ml-6 pl-4 border-l-2 border-primary rounded-md"
              style={{
                background: `linear-gradient(to right, rgba(var(--color-primary) / 0.05), transparent)`,
              }}
            >
              {paragraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className="mb-4 last:mb-1 pb-3 last:pb-1"
                  style={{
                    borderBottom:
                      index < paragraphs.length - 1
                        ? '1px dashed rgba(var(--color-border) / 0.5)'
                        : 'none',
                  }}
                >
                  {index > 0 && (
                    <div className="flex items-center mb-2">
                      <div className="h-1 w-1 rounded-full bg-primaryDark mr-2"></div>
                      <span className="text-xs font-medium text-primaryDark">
                        Step {index + 1}
                      </span>
                    </div>
                  )}

                  {animate ? (
                    <TypewriterEffect
                      text={paragraph}
                      typingSpeed={5}
                      className="text-sm text-secText leading-relaxed whitespace-pre-wrap"
                    />
                  ) : (
                    <p className="text-sm text-secText leading-relaxed whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReasoningMessageItem;
