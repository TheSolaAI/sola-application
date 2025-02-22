/**
 * Component to display configurable settings to the user
 */
import useThemeManager from '../models/ThemeManager.ts';
import { motion } from 'framer-motion';
import { IoIosSunny, IoMdArrowRoundBack } from 'react-icons/io';
import { IoMoonOutline } from 'react-icons/io5';
import { useSessionHandler } from '../models/SessionHandler.ts';
import { useSettingsHandler } from '../models/SettingsHandler.ts';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';

const MAX_CHARS = 200;

const Settings: React.FC = () => {
  /**
   * Global State Management
   */
  const { theme, setTheme } = useThemeManager();
  const { aiEmotion, setAiEmotion, sendUpdateMessage } = useSessionHandler();

  /**
   * Using privy hook to add or remove email
   */
  const { linkEmail, unlinkEmail, user } = usePrivy();

  /**
   * Local state to handle theme,config changes
   */
  const [localTheme, setLocalTheme] = useState<string>(theme.name);
  const [traits, setTraits] = useState<string>(aiEmotion || '');

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
          <div className="flex flex-col gap-2">
            <label className="text-textColor font-medium">
              What traits should Sola AI have?
            </label>
            <div className="relative">
              <textarea
                value={traits}
                onChange={(e) => {
                  const input = e.target.value;
                  if (input.length <= MAX_CHARS) {
                    setTraits(input);
                  }
                }}
                className="w-full min-h-[120px] p-3 rounded-lg bg-background text-textColor
                          border border-border focus:outline-none focus:ring-2
                          focus:ring-primary resize-none"
                placeholder="Enter Sola's personality traits..."
              />
              <div className="absolute bottom-2 right-2 text-sm text-textColor/60">
                {traits.length}/{MAX_CHARS}
              </div>
            </div>
            <button
              onClick={() => {
                useSettingsHandler.getState().updateSettings(traits, undefined);
                if (traits.length <= MAX_CHARS) {
                  sendUpdateMessage(traits);
                  setAiEmotion(traits);
                } else {
                  toast.warning('Character Limit Exceeded!');
                }
              }}
              className="mt-2 px-4 py-2 bg-primary text-textColor rounded-lg
            hover:bg-primaryDark transition-colors w-fit"
            >
              Save Traits
            </button>
          </div>

          {/* Email Configuration Section */}
          <div className="flex flex-col gap-2">
            <label className="text-textColor font-medium">
              Email Configuration
            </label>
            <div className="flex items-center gap-4">
              {user?.email ? (
                <>
                  <span className="text-textColor/80">
                    {user.email?.address}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await unlinkEmail(user.email.address);
                        toast.success('Email unlinked successfully');
                      } catch (error) {
                        toast.error('Failed to unlink email');
                      }
                    }}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg
                hover:bg-red-600 transition-colors"
                  >
                    Unlink Email
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    try {
                      linkEmail();
                    } catch (error) {
                      toast.error('Failed to link email');
                    }
                  }}
                  className="px-4 py-2 bg-primary text-textColor rounded-lg
              hover:bg-primaryDark transition-colors"
                >
                  Link Email
                </button>
              )}
            </div>
          </div>

          {/* Toggle app theme */}
          <div className="flex items-center gap-4">
            <span className="text-textColor">Theme (Light/Dark) :</span>
            <div
              className="w-16 h-8 bg-primary rounded-full flex items-center p-1 cursor-pointer"
              onClick={() => {
                if (localTheme === 'light') {
                  setLocalTheme('dark');
                } else {
                  setLocalTheme('light');
                }
                setTheme(localTheme);
                useSettingsHandler
                  .getState()
                  .updateSettings(undefined, localTheme);
              }}
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
