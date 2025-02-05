/**
 * Component to render an audio player with controls. This component uses `ReactAudioPlayer` for rendering audio controls.
 *
 * Props:
 * - `index`: The index of the audio item, used as the key in the component.
 * - `base64URL`: The base64-encoded audio URL for the audio file.
 */

import ReactAudioPlayer from 'react-audio-player';
import { AudioLines } from 'lucide-react';
import useThemeManager from '../../models/ThemeManager.ts';

interface AudioPlayerProps {
  index: number;
  base64URL: string;
}

export const AudioPlayer = ({ index, base64URL }: AudioPlayerProps) => {
  const { theme } = useThemeManager();

  return (
    <div
      key={index}
      className="flex flex-row-reverse items-start my-1 py-1 gap-2 md:gap-4 self-end justify-end max-w-[90%] md:max-w-[80%] overflow-hidden"
    >
      <div>
        <AudioLines color={theme.secText} />
      </div>
      <div className="flex text-secText justify-end rounded-lg">
        <ReactAudioPlayer
          src={base64URL}
          controls
          autoPlay={false}
          className="max-w-[90%] drop-shadow-md invert contrast-75"
        />
      </div>
    </div>
  );
};
