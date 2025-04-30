'use client';

import { useLayoutContext } from '@/providers/LayoutProvider';
import { FC, ReactNode, useState, useRef, useEffect } from 'react';

interface BaseExpandableMessageItemProps {
  title: string;
  icon?: ReactNode;
  compactContent: ReactNode;
  expandedContent: ReactNode;
  footer?: ReactNode;
  initialExpanded?: boolean;
}

export const BaseExpandableMessageItem: FC<BaseExpandableMessageItemProps> = ({
  title,
  icon,
  compactContent,
  expandedContent,
  footer,
  initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const compactContentRef = useRef<HTMLDivElement>(null);

  // Get height of expanded content when it changes
  useEffect(() => {
    if (expandedContentRef.current) {
      setContentHeight(expandedContentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Match this with the CSS transition duration
  };

  const { dashboardOpen } = useLayoutContext();

  const maxWidth = dashboardOpen ? 'max-w-[100%]' : 'max-w-[40%]';

  const containerClasses = isExpanded
    ? 'flex my-1 justify-start max-w-[100%] md:max-w-[80%] transition-all duration-300 ease-in-out'
    : `flex my-1 justify-start max-w-[100%] ${maxWidth} transition-all duration-300 ease-in-out`;

  // Compact view content
  const compactView = (
    <div ref={compactContentRef}>
      {/* Compact Header */}
      <div className="p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <div className="bg-surface/30 p-1 rounded-lg">{icon}</div>}
          <h3 className="font-medium text-textColor text-sm">{title}</h3>
        </div>
        {compactContent}
      </div>

      {/* Compact Footer */}
      <div className="p-2 bg-surface/20 flex justify-between items-center">
        {footer}
      </div>
    </div>
  );

  // Expanded view content
  const expandedView = <div ref={expandedContentRef}>{expandedContent}</div>;

  return (
    <div className={containerClasses}>
      <div
        className="w-full overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg cursor-pointer hover:border-primary/30 transition-all duration-300 ease-in-out"
        onClick={toggleExpand}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '100px',
          opacity: isAnimating ? (isExpanded ? 1 : 0.9) : 1,
          transform: isAnimating
            ? isExpanded
              ? 'scale(1)'
              : 'scale(0.99)'
            : 'scale(1)',
        }}
      >
        {isExpanded ? expandedView : compactView}
      </div>
    </div>
  );
};
