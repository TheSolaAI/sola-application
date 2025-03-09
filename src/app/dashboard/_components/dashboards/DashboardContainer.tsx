import { FC, ReactNode, useEffect } from 'react';
import useIsMobile from '@/utils/isMobile';

interface DashBoardContainerProps {
  children: ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title?: string;
}

/**
 * Canvas component that is used for rendering any dashboards next to the chat.
 * Occupies around 75% of the chat area while reducing the chat area down to 25%
 */
export const DashBoardContainer: FC<DashBoardContainerProps> = ({
  children,
  visible,
  setVisible,
  title = 'Dashboard',
}) => {
  const isMobile = useIsMobile();

  // Close dashboard with escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        setVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, setVisible]);

  return (
    <div
      className={`h-full bg-sec_background sm:rounded-2xl transition-all duration-500 overflow-y-auto flex
        ${visible ? 'opacity-100 sm:ml-2 w-[75%] p-2' : 'w-0 opacity-100'}
        ${isMobile && visible && 'min-w-[100%]'}
      `}
    >
      <div className={`w-full ${!visible && 'hidden'}`}>
        {/* Header - Container */}
        <div className="flex flex-row mt-2 gap-x-2 w-full justify-between items-center">
          {/* Title */}
          <div className="font-semibold text-lg px-4 text-textColor">
            {title}
          </div>

          {/* Close Button */}
          <button
            onClick={() => setVisible(false)}
            className="flex justify-center text-textColor items-center p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
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
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 px-4 pb-4">{children}</div>
      </div>
    </div>
  );
};
