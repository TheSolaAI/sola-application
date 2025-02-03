import useThemeManager from '../../models/ThemeManager';
import { MessageCard } from '../../types/messageCard';
import { Bot } from 'lucide-react';

interface AgentTranscriptionProps {
  item: MessageCard;
  index: number;
}

export default function AgentTranscription({
  item,
  index,
}: AgentTranscriptionProps) {
  const { theme } = useThemeManager();

  return (
    <div
      key={index}
      className="flex gap-2 my-1 md:gap-4 justify-start max-w-[90%] md:max-w-[80%] transition-opacity duration-500"
    >
      {' '}
      <div className="">
        <Bot color={theme.secText} />
      </div>
      <div className="bg-sec_background text-secText p-2 w-full  rounded-lg break-words whitespace-normal">
        {item.message}
      </div>
    </div>
  );
}
