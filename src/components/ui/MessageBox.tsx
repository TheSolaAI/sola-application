import useThemeManager from '../../models/ThemeManager';
import { MessageCard } from '../../types/messageCard';
import { Bot } from 'lucide-react';

interface MessageBoxProps {
  item: MessageCard;
  index: number;
}

export default function MessageBox({ item, index }: MessageBoxProps) {
  const { theme } = useThemeManager();

  return (
    <div
      key={index}
      className="flex gap-2 my-2 md:gap-4 justify-start max-w-[70%] md:max-w-[80%] transition-opacity duration-500"
    >
      {' '}
      <div className='opacity-0'>
        <Bot color={theme.secText} />
      </div>
      <div className="bg-sec_background text-secText p-2 w-full  rounded-lg break-words whitespace-normal">
        {item.message}
      </div>
    </div>
  );
}
