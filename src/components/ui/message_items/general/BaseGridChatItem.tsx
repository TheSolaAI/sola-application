import { ReactNode, useRef, useState, useEffect } from 'react';
import useThemeManager from '../../../../models/ThemeManager.ts';
import { Bot } from 'lucide-react';

interface BaseGridChatItemProps {
  col: number;
  children: ReactNode;
}

export default function BaseGridChatItem({
  col,
  children,
}: BaseGridChatItemProps) {
  const { theme } = useThemeManager();
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

  return (
    <div
      ref={containerRef}
      className="flex gap-2 my-1 md:gap-4 justify-start max-w-[90%] md:max-w-[80%] transition-opacity duration-500"
    >
      <div className="opacity-0">
        <Bot color={theme.secText} />
      </div>
      <div
        className={`grid grid-cols-${dynamicCols} gap-4 p-2 w-full rounded-lg break-words whitespace-normal`}
      >
        {children}
      </div>
    </div>
  );
}
