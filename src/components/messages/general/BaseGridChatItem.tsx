'use client';

import { ReactNode, useRef, useState, useEffect } from 'react';

interface BaseGridChatItemProps {
  col: number;
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function BaseGridChatItem({
  col,
  children,
  title,
  subtitle,
}: BaseGridChatItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicCols, setDynamicCols] = useState(col);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const width = entries[0].contentRect.width;
      if (width < 400) {
        setDynamicCols(1);
      } else if (width < 700) {
        setDynamicCols(2);
      } else {
        setDynamicCols(col);
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [col]);

  // Function to generate the grid template columns
  const getGridTemplateColumns = () => {
    return `grid-cols-1 sm:grid-cols-1 md:grid-cols-${dynamicCols > 2 ? 2 : dynamicCols} lg:grid-cols-${dynamicCols}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex my-1 justify-start w-full transition-opacity duration-500"
    >
      {title ? (
        <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
          {/* Optional Header */}
          <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-primary/10">
            <h2 className="text-lg font-semibold text-textColor flex items-center gap-2">
              {title}
            </h2>
            {subtitle && (
              <span className="text-xs text-secText bg-surface/50 px-2 py-1 rounded">
                {subtitle}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div
              className={`grid ${getGridTemplateColumns()} gap-4 w-full break-words whitespace-normal`}
            >
              {children}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`grid ${getGridTemplateColumns()} gap-4 p-2 w-full rounded-lg break-words whitespace-normal`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
