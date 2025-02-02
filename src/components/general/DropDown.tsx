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
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  anchorEl,
  title,
  mobileTitle,
  children,
  width,
  direction,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    bottom: 0,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isOpen && anchorEl && popupRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      setPosition({
        top: direction === 'down' ? anchorRect.bottom + window.scrollY + 10 : 0, // 10px spacing
        bottom:
          direction === 'up'
            ? window.innerHeight - anchorRect.top + window.scrollY
            : 0,
        left: anchorRect.x + window.scrollX, // Ensures alignment with the button
        width: width === 'component' ? anchorRect.width : 'auto',
      });
    }
  }, [isOpen, anchorEl, isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        anchorEl &&
        !anchorEl.contains(event.target)
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
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-border bg-background p-4 max-h-[80vh] overflow-y-auto w-screen flex flex-col items-center"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
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
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed z-50 rounded-xl border-border border-[0.5px] bg-background p-2"
        style={{
          top: position.top ? `${position.top}px` : 'auto',
          left: position.left ? `${position.left}px` : 'auto',
          width: position.width === 'auto' ? 'auto' : `${position.width}px`, // Fix width assignment
          bottom: position.bottom ? `${position.bottom}px` : 'auto',
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
