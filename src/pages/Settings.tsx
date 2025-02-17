/**
 * Component to display configurable settings to the user
 */
import useThemeManager from '../models/ThemeManager.ts';
import { Sun, Moon, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { theme, setTheme } = useThemeManager();
  const goBack = () => {
    window.history.back(); // Navigates back to the previous page
  };

  return (
    <div className=" h-screen p-4 bg-background animate-in fade-in-0 duration-300">
      <div className=" relative bg-sec_background rounded-lg p-4 top-12 sm:top-2">
        {/* Close button */}
        <button 
          className="absolute top-2 right-2 text-textColor hover:text-red-500" 
          onClick={goBack}
        >
          <X size={20} />
        </button>
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
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
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
