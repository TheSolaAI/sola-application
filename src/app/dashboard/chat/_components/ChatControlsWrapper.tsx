import { useChat } from '@/providers/ChatContextProvider';
import SessionControls from '@/app/dashboard/chat/_components/SessionControls';
import InfoText from '@/app/dashboard/chat/_components/InfoText';
import useKeyboardHeight from '@/hooks/useKeyboardHeight';

export default function ChatControlsWrapper() {
  const { processMessage, isLoading, handleUserInteraction, isAudioPlaying } =
    useChat();
  const { isPWA, keyboardHeight } = useKeyboardHeight();

  return (
    <div
      className="absolute left-0 right-0 z-20 p-4 pb-8 bottom-0"
      style={{
        bottom: isPWA && keyboardHeight > 0 ? `${keyboardHeight}px` : 0,
        transition: 'background 0.1s linear',
      }}
    >
      <SessionControls
        onSendMessage={processMessage}
        isProcessing={isLoading}
        onUserInteraction={handleUserInteraction}
        isAudioPlaying={isAudioPlaying}
      />
      <InfoText />
    </div>
  );
}
