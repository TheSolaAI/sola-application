import { UserAudioChatContent } from '../../../types/chatItem.ts';
import MarkDownRenderer from './general/MarkDownRenderer.tsx';

interface AudioPlayerChatItemProps {
  props: UserAudioChatContent;
}

export const AudioPlayerMessageItem = ({ props }: AudioPlayerChatItemProps) => {
  return (
    <div className="flex flex-row-reverse my-1 max-w-[100%] overflow-hidden">
      <div className="flex p-2 bg-sec_background rounded-lg text-secText max-w-[100%] sm:max-w-[80%] overflow-hidden">
        <MarkDownRenderer content={props.text} />
      </div>
    </div>
  );
};
