import { AudioLines } from 'lucide-react';
import useThemeManager from '../../../models/ThemeManager.ts';
import { UserAudioChatContent } from '../../../types/chatItem.ts';

interface AudioPlayerChatItemProps {
  props: UserAudioChatContent;
}

export const AudioPlayerMessageItem = ({ props }: AudioPlayerChatItemProps) => {
  const { theme } = useThemeManager();

  return (
    <div className="flex flex-row-reverse items-start my-1 py-1 gap-2 md:gap-4 max-w-[100%] md:max-w-[90%] overflow-hidden">
      <div>
        <AudioLines color={theme.secText} strokeWidth={1.2} />
      </div>
      <div className="flex justify-end overflow-hidden">
        <audio
          src={props.text}
          controls
          preload="metadata"
          className="max-w-[90%] drop-shadow-md my-1 invert contrast-75"
        />
      </div>
    </div>
  );
};
