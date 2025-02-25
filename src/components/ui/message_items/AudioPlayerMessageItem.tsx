import { AudioLines } from 'lucide-react';
import useThemeManager from '../../../models/ThemeManager.ts';
import { UserAudioChatContent } from '../../../types/chatItem.ts';
import MarkDownRenderer from './general/MarkDownRenderer.tsx';

interface AudioPlayerChatItemProps {
  props: UserAudioChatContent;
}

export const AudioPlayerMessageItem = ({ props }: AudioPlayerChatItemProps) => {
  const { theme } = useThemeManager();

  return (
    <div className="flex flex-row-reverse self-end items-start my-1 gap-2 md:gap-4 max-w-[100%] overflow-hidden">
      <div>
        <AudioLines color={theme.secText} strokeWidth={1.2} />
      </div>
      <div className="flex justify-end p-2 bg-sec_background rounded-lg text-secText max-w-[100%] sm:max-w-[80%] overflow-hidden">
        <MarkDownRenderer content={props.text} />
      </div>
    </div>
  );
};
