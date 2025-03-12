import { UserAudioChatContent } from '@/types/chatItem';

interface AudioPlayerChatItemProps {
  props: UserAudioChatContent;
}

export const AudioPlayerMessageItem = ({ props }: AudioPlayerChatItemProps) => {
  return (
    <div className="flex flex-row-reverse my-1 max-w-[100%] overflow-hidden animate-in fade-in-100 duration-200">
      <div className="flex flex-col gap-1 py-2 px-4 bg-sec_background rounded-xl text-secText max-w-[100%] sm:max-w-[80%] overflow-hidden">
        <span className="font-medium">{props.text}</span>
        <span className="text-xs opacity-50 self-end">
          {props.sender === 'assistant' ? 'transcript-beta' : ''}
        </span>
      </div>
    </div>
  );
};
