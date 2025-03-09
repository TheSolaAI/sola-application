'use client';
import { useState, useRef, useEffect, MouseEvent } from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';

const InfoText: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Handle mouseenter with slight delay
  const handleMouseEnter = (): void => {
    setIsHovered(true);
  };

  // Handle mouseleave with slight delay
  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | any): void => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center w-full">
      {/* This is the existing text with the info icon */}
      <div
        className="flex items-center justify-center gap-1 text-secText text-xs cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleMouseEnter}
      >
        <FaCircleInfo className="w-3 h-3" /> Sola AI is still in development.
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 w-64 bg-sec_background border border-border rounded-lg shadow-lg p-4 z-50"
          >
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-secText">
                Development Status
              </h3>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                  <p className="text-xs text-secText">
                    This is a beta release with experimental features that may
                    change for the better based on user feedback.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                  <p className="text-xs text-secText">
                    Always perform any financial transactions with caution.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                  <p className="text-xs text-secText">
                    We&#39;re actively improving functionality based on user
                    feedback. You can report any issues or feature requests on
                    our GitHub.
                  </p>
                </div>
              </div>

              <div className="text-xs text-secText mt-1 pt-2 border-t border-border">
                <span className="font-medium">Last Updated:</span> March 2025
              </div>
            </div>

            {/* Triangle pointer */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-sec_background border-r border-b border-border"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoText;
