import { ReactNode } from 'react';
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

  return (
    <div className="flex gap-2 my-1 md:gap-4 justify-start max-w-[90%] md:max-w-[80%] transition-opacity duration-500">
      {' '}
      <div className="opacity-0">
        <Bot color={theme.secText} />
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-${col} gap-4 p-2 w-full rounded-lg break-words whitespace-normal`}
      >
        {children}
      </div>
    </div>
  );
}
