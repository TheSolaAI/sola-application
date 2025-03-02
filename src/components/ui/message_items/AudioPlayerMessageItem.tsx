import { UserAudioChatContent } from '../../../types/chatItem.ts';

interface AudioPlayerChatItemProps {
  props: UserAudioChatContent;
}

export const AudioPlayerMessageItem = ({ props }: AudioPlayerChatItemProps) => {
  // Option 1: Equalizer animation
  const renderEqualizer = () => (
    <div className="flex items-center h-6 mr-2">
      <div className="flex items-end space-x-1">
        {[3, 5, 4, 7, 3, 6, 5].map((height, index) => (
          <div
            key={index}
            className={`w-1 bg-secText rounded-full`}
            style={{
              height: `${height}px`,
              animation: `equalizerBar 1.2s ease-in-out ${index * 0.15}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes equalizerBar {
          0% {
            transform: scaleY(0.8);
          }
          100% {
            transform: scaleY(2.2);
          }
        }
      `}</style>
    </div>
  );

  return (
    <div className="flex flex-row-reverse my-1 max-w-[100%] overflow-hidden">
      <div className="flex gap-4 items-center p-3 bg-sec_background rounded-lg text-secText max-w-[100%] sm:max-w-[80%] overflow-hidden">
        {renderEqualizer()}
        <div className="flex flex-col">
          <span className="font-medium">Audio Captured</span>
          <span className="text-xs opacity-75">User Input</span>
        </div>
      </div>
    </div>
  );
};
