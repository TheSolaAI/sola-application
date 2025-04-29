import { useRef, useEffect } from 'react';
import { useChat } from '@/providers/ChatContextProvider';
import SkeletonWave from '@/components/common/SkeletonWave';
import useThemeManager from '@/store/ThemeManager';
import { hexToRgb } from '@/utils/hexToRGB';
import { FaArrowAltCircleDown } from 'react-icons/fa';
import { renderMessageContent } from '@/lib/messageRenderer';

export default function ChatMessages() {
  const {
    messages,
    isLoading,
    error,
    showScrollButton,
    handleScroll,
    scrollToBottom,
  } = useChat();
  const { theme } = useThemeManager();
  const primaryRGB = hexToRgb(theme.primary);

  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (!container) return;

    const handleScrollEvent = () => handleScroll(container);
    container.addEventListener('scroll', handleScrollEvent);
    return () => container.removeEventListener('scroll', handleScrollEvent);
  }, [handleScroll]);

  return (
    <>
      {/* Top fade gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, 
              ${theme.background} 0%,
              rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0) 100%
            )`,
        }}
      />

      {/* Scrollable content */}
      <div
        ref={scrollableContainerRef}
        className="absolute inset-0 overflow-y-auto no-scrollbar messages-container"
      >
        <div className="w-full sm:w-[80%] mx-auto pb-32 mt-10">
          {messages.map((message, index) => (
            <div key={`message-${message.id || index}`}>
              {renderMessageContent(message)}
            </div>
          ))}

          {/* Show loading indicator when processing */}
          {isLoading && <SkeletonWave />}

          {/* Show error if any */}
          {error && (
            <div className="text-red-500 p-3 rounded-lg">
              An error occurred. Please try again.
            </div>
          )}
        </div>

        {/* This empty div is used as a reference for scrolling to the bottom */}
        <div ref={messagesEndRef} className="messages-end" />
      </div>

      {/* Bottom fade gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to top, 
              ${theme.background} 0%,
              rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, 0) 100%
            )`,
        }}
      />

      {/* Floating scroll to bottom button */}
      {showScrollButton && (
        <button
          className="fixed bottom-24 right-8 bg-primary text-white p-2 rounded-full shadow-lg z-50"
          onClick={() => scrollToBottom(messagesEndRef.current)}
        >
          <FaArrowAltCircleDown size={16} />
        </button>
      )}
    </>
  );
}
