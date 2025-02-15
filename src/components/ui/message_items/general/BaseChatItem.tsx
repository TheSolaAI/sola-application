import { ReactNode } from 'react';
import useThemeManager from '../../../../models/ThemeManager.ts';
import { Volleyball } from 'lucide-react';

interface BaseChatItemProps {
  children: ReactNode;
}

export default function BaseChatItem({ children }: BaseChatItemProps) {
  const { theme } = useThemeManager();

  return (
    <div className="flex gap-2 my-1 md:gap-4 justify-start max-w-[90%] md:max-w-[80%] transition-opacity duration-500">
      {' '}
      <div>
        <Volleyball color={theme.secText} strokeWidth={1.2} />
      </div>
      <div className="bg-sec_background text-secText p-2 w-full rounded-lg break-words whitespace-normal">
        {children}
      </div>
    </div>
  );
}
