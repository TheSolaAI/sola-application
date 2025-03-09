import { FC, ReactNode, useEffect } from 'react';
import useIsMobile from '../../utils/isMobile';
import { XIcon } from 'lucide-react';
import { useLayoutContext } from '../../layout/LayoutProvider';

interface DashBoardContainerProps {
  children: ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

/**
 * Canvas component that is used for rendering any dashboards next to the chat.
 * Occupies around 75% of the chat area while reducing the chat area down to 25%
 */
export const DashBoardContainer: FC<DashBoardContainerProps> = ({
  children,
  visible,
  setVisible,
}) => {
  const isMobile = useIsMobile();

  /**
   * Global State
   */
  const { dashBoardTitle } = useLayoutContext();

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
      className={`h-full bg-sec_background sm:rounded-xl transition-all duration-500 overflow-y-auto flex
        ${visible ? 'opacity-100 sm:ml-2 w-[75%] p-2' : 'w-0 opacity-100'}
        ${isMobile && visible && 'min-w-[100%]'}
      `}
    >
      <div className={`w-full ${!visible && 'hidden'}`}>
        {/* Header - Container */}
        <div className="flex flex-row mt-2 gap-x-2 w-full justify-between items-center">
          {/* Title */}
          <div className="font-semibold text-lg px-4 text-textColor">
            {dashBoardTitle}
          </div>

          {/* Close Button */}
          <XIcon
            className="h-8 w-8 cursor-pointer text-secText  "
            onClick={() => setVisible(false)}
          />
        </div>

        {/* Content */}
        <div className=" mt-2 p-2">{children}</div>
      </div>
    </div>
  );
};
