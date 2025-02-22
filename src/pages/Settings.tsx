/**
 * Component to display configurable settings to the user
 */
import useThemeManager from '../models/ThemeManager.ts';
import { motion } from 'framer-motion';
import { IoIosSunny, IoMdArrowRoundBack } from 'react-icons/io';
import { IoMoonOutline } from 'react-icons/io5';

const Settings: React.FC = () => {
  /**
   * Global State Management
   */
  const { theme, setTheme } = useThemeManager();

  const handleGoBack = () => {
    window.history.back(); // Navigates back to the previous page
  };

  return (
    <div className="relative flex flex-col gap-2 top-12 h-screen p-4 bg-background animate-in fade-in-0 duration-300">
      {/* Close button */}
      <button
        className="top-8 px-4 w-fit py-2 bg-primary text-textColor rounded-full hover:text-textColorContrast hover:bg-primaryDark"
        onClick={handleGoBack}
      >
        <IoMdArrowRoundBack />
      </button>
      <div className="bg-sec_background rounded-lg p-4 top-4 sm:top-16">
        <h1 className="font-bold text-xl dark:text-purple-300">
          APP CONFIGURATION:
        </h1>
        <div className="flex flex-col gap-6 p-4 m-4">
          {/* Toggle app theme */}
          <div className="flex items-center gap-4">
            <span className="text-textColor">Theme (Light/Dark) :</span>
            <div
              className="w-16 h-8 bg-border rounded-full flex items-center p-1 cursor-pointer"
              onClick={() =>
                setTheme(theme.name === 'light' ? 'dark' : 'light')
              }
            >
              <motion.div
                className="w-6 h-6 bg-background text-textColor rounded-full flex items-center justify-center"
                animate={{ x: theme.name === 'light' ? 0 : 32 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {theme.name === 'light' ? (
                  <IoIosSunny size={16} />
                ) : (
                  <IoMoonOutline size={16} />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
