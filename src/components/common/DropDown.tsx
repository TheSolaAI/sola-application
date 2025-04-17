'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: null | HTMLElement;
  title?: string;
  mobileTitle?: string;
  children: React.ReactNode;
  width?: 'component' | 'auto';
  direction: 'up' | 'down';
  horizontalAlignment?: 'left' | 'right' | 'auto';
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  anchorEl,
  title,
  mobileTitle,
  children,
  width = 'auto',
  direction,
  horizontalAlignment = 'auto',
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    bottom: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [finalHorizontalAlignment, setFinalHorizontalAlignment] = useState<
    'left' | 'right'
  >('right');

  useEffect(() => {
    if (isOpen && anchorEl && popupRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const popupWidth = popupRef.current.offsetWidth;
      const windowWidth = window.innerWidth;

      // Determine horizontal alignment
      let calculatedLeft: number;
      let alignment: 'left' | 'right' = 'right';

      if (horizontalAlignment === 'auto') {
        // Check space on both sides
        const spaceOnRight = windowWidth - anchorRect.right;
        const spaceOnLeft = anchorRect.left;

        // Prefer the side with more space
        if (spaceOnRight >= popupWidth) {
          calculatedLeft = anchorRect.left + window.scrollX;
          alignment = 'left';
        } else if (spaceOnLeft >= popupWidth) {
          calculatedLeft = anchorRect.right - popupWidth + window.scrollX;
          alignment = 'right';
        } else {
          // If no side has enough space, default to right
          calculatedLeft = anchorRect.left + window.scrollX;
          alignment = 'left';
        }
      } else if (horizontalAlignment === 'left') {
        // Left edge, expanding right
        calculatedLeft = anchorRect.left + window.scrollX;
        alignment = 'left';
      } else {
        // Right edge, expanding left
        calculatedLeft = anchorRect.right - popupWidth + window.scrollX;
        alignment = 'right';
      }

      setFinalHorizontalAlignment(alignment);

      // Apply width based on the width prop
      const calculatedWidth =
        width === 'component' ? anchorRect.width : popupWidth;

      setPosition({
        top: direction === 'down' ? anchorRect.bottom + window.scrollY + 10 : 0, // 10px spacing
        bottom:
          direction === 'up'
            ? window.innerHeight - anchorRect.top + window.scrollY
            : 0,
        left: calculatedLeft,
        width: calculatedWidth,
      });
    }
  }, [isOpen, anchorEl, isMobile, horizontalAlignment, width, direction]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          ref={popupRef}
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-border bg-background max-h-[80vh] overflow-y-auto w-screen flex flex-col items-center"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-4" />
          {mobileTitle && (
            <h1 className="text-xl font-bold text-textColor px-2 mb-4">
              {mobileTitle}
            </h1>
          )}
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div ref={popupRef}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed z-50 rounded-xl bg-baseBackground p-2 ${
          finalHorizontalAlignment === 'right'
            ? 'origin-top-right'
            : 'origin-top-left'
        }`}
        style={{
          top: position.top ? `${position.top}px` : 'auto',
          bottom: position.bottom ? `${position.bottom}px` : 'auto',
          left: position.left ? `${position.left}px` : 'auto',
          width: width === 'component' ? `${position.width}px` : 'auto',
        }}
      >
        {title && (
          <h1 className="text-xl font-bold text-textColor p-2">{title}</h1>
        )}
        {children}
      </motion.div>
    </div>
  );
};
