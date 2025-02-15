/**
 * Component to render an audio player with controls. This component uses `ReactAudioPlayer` for rendering audio controls.
 *
 * Props:
 * - `index`: The index of the audio item, used as the key in the component.
 * - `base64URL`: The base64-encoded audio URL for the audio file.
 */

import ReactAudioPlayer from 'react-audio-player';
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
      <div className="flex text-secText justify-end rounded-lg">
        <ReactAudioPlayer
          src={props.text}
          controls
          autoPlay={false}
          className="max-w-[90%] drop-shadow-md invert contrast-75"
        />
      </div>
    </div>
  );
};
