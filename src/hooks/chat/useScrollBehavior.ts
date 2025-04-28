import { useState, useRef, useEffect } from 'react';

export function useScrollBehavior() {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAutoScrollEnabled = useRef(true);
  const isScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent too frequent scroll updates during streaming
  const throttleScroll = (fn: () => void) => {
    if (isScrolling.current) return;

    isScrolling.current = true;
    requestAnimationFrame(() => {
      fn();
      setTimeout(() => {
        isScrolling.current = false;
      }, 100);
    });
  };

  const handleScroll = (scrollableElement: HTMLElement | null) => {
    if (!scrollableElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (isAutoScrollEnabled.current !== isAtBottom) {
      isAutoScrollEnabled.current = isAtBottom;
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = (
    messagesEndElement: HTMLElement | null,
    force = false
  ) => {
    if (!messagesEndElement) return;
    if (!isAutoScrollEnabled.current && !force) return;

    // Cancel any pending scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Throttle scroll during streaming to prevent jumpiness
    throttleScroll(() => {
      messagesEndElement.scrollIntoView({
        behavior: isScrolling.current ? 'auto' : 'smooth',
        block: 'end',
      });
    });
  };

  const manualScrollToBottom = (messagesEndElement: HTMLElement | null) => {
    if (!messagesEndElement) return;

    isAutoScrollEnabled.current = true;
    setShowScrollButton(false);

    messagesEndElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    showScrollButton,
    isAutoScrollEnabled,
    handleScroll,
    scrollToBottom,
    manualScrollToBottom,
  };
}
