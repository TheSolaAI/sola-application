import { FC, ReactNode, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import useIsMobile from '@/utils/isMobile';
import { useLayoutContext } from '@/providers/LayoutProvider';

interface DashBoardContainerProps {
  children: ReactNode;
}

/**
 * Canvas component that is used for rendering any dashboards next to the chat.
 * Occupies around 75% of the chat area while reducing the chat area down to 25%
 */
const DashBoardContainer: FC<DashBoardContainerProps> = memo(({ children }) => {
  const isMobile = useIsMobile();

  // get the title of the dashboard from the layout context
  const { dashboardTitle, dashboardOpen, handleDashboardOpen } =
    useLayoutContext();

  // Close dashboard with escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dashboardOpen) {
        handleDashboardOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dashboardOpen, handleDashboardOpen]);

  // Define animation variants
  const containerVariants = {
    hidden: {
      width: 0,
      opacity: 0,
      transition: { duration: 0.3 },
    },
    visible: {
      width: isMobile ? '100%' : '75%',
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className={`h-full bg-sec_background sm:rounded-2xl overflow-y-auto flex 
                    ${dashboardOpen ? 'opacity-100 sm:ml-2 w-[75%]' : 'w-0 opacity-100'}
                    ${isMobile && dashboardOpen && 'min-w-[100%]'}`}
      initial="hidden"
      animate={dashboardOpen ? 'visible' : 'hidden'}
      variants={containerVariants}
      layout
    >
      {dashboardOpen && (
        <div className="w-full">
          {/* Header - Container */}
          <div className="flex flex-row mt-2 px-4 gap-x-2 w-full justify-between items-center">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-semibold text-lg px-2 text-textColor"
            >
              {dashboardTitle}
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => handleDashboardOpen(false)}
              className="flex justify-center text-textColor items-center p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </div>

          {/* Content */}
          <motion.div
            className="mt-4 px-4 pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
});

DashBoardContainer.displayName = 'DashBoardContainer';

export { DashBoardContainer };
