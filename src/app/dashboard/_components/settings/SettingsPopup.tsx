import { useState, FC, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosSunny, IoMdClose } from 'react-icons/io';
import { IoMoonOutline } from 'react-icons/io5';
import { FaWallet } from 'react-icons/fa';
import { RiRobot2Line } from 'react-icons/ri';
import useThemeManager from '@/store/ThemeManager';
import {
  AIConfigSettings,
  AIConfigSettingsRef,
} from '@/app/dashboard/_components/settings/AiConfigSettings';
import { LuUser } from 'react-icons/lu';
import {
  UserSettings,
  UserSettingsRef,
} from '@/app/dashboard/_components/settings/UserSettings';
import {
  ThemeSettings,
  ThemeSettingsRef,
} from '@/app/dashboard/_components/settings/ThemeSettings';
import { WalletSettings } from '@/app/dashboard/_components/settings/WalletSettings';
import { toast } from 'sonner';

export const SettingsModal: FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  // Global State Management
  const { theme } = useThemeManager();

  // Local state
  const [activeSection, setActiveSection] = useState<string>('ai');

  // refs
  const aiConfigRef = useRef<AIConfigSettingsRef>(null);
  const walletSettingsRef = useRef<UserSettingsRef>(null);
  const userSettingsRef = useRef<UserSettingsRef>(null);
  const themeSettingsRef = useRef<ThemeSettingsRef>(null);

  // Handle section change
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  /**
   * Function to handle done button click. In this case call the submit method in all the settings components
   */
  const onDoneClicked = () => {
    aiConfigRef.current?.onSubmit();
    walletSettingsRef.current?.onSubmit();
    userSettingsRef.current?.onSubmit();
    themeSettingsRef.current?.onSubmit();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container - Using Flexbox for centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal */}
            <motion.div
              layout // Added layout prop for smooth size transitions
              transition={{
                // Configure transition for smooth height changes
                layout: {
                  duration: 0.3,
                  ease: 'easeOut',
                },
              }}
              className={`bg-background overflow-hidden ${
                isMobile
                  ? 'w-screen h-screen'
                  : 'w-full max-w-4xl h-auto max-h-[85vh] rounded-2xl shadow-xl'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex h-full">
                {/* Vertical Sidebar Navigation */}
                <div
                  className={`border-r border-border bg-sec_background flex-shrink-0 ${isMobile ? 'w-fit' : 'w-64'}`}
                >
                  {/* Header in Sidebar */}
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2
                      className={`text-xl font-bold text-textColor ${isMobile ? 'hidden' : 'block'}`}
                    >
                      Settings
                    </h2>
                    {isMobile && (
                      <button
                        onClick={onClose}
                        className={`rounded-full bg-sec_background text-textColor hover:bg-primary transition-colors ${isMobile ? 'p-0' : 'p-2'}`}
                      >
                        <IoMdClose size={20} />
                      </button>
                    )}
                  </div>

                  {/* Navigation Items */}
                  <div className="flex flex-col py-2">
                    <button
                      onClick={() => handleSectionChange('ai')}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        activeSection === 'ai'
                          ? 'bg-primary/10 text-primary border-r-4 border-primary'
                          : 'text-textColor hover:bg-background/50'
                      }`}
                    >
                      <RiRobot2Line size={18} />
                      <span className={`${isMobile ? 'hidden' : 'block'}`}>
                        AI Configuration
                      </span>
                    </button>

                    <button
                      onClick={() => handleSectionChange('wallet')}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        activeSection === 'wallet'
                          ? 'bg-primary/10 text-primary border-r-4 border-primary'
                          : 'text-textColor hover:bg-background/50'
                      }`}
                    >
                      <FaWallet size={18} />
                      <span className={`${isMobile ? 'hidden' : 'block'}`}>
                        Wallet Settings
                      </span>
                    </button>

                    <button
                      onClick={() => handleSectionChange('theme')}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        activeSection === 'theme'
                          ? 'bg-primary/10 text-primary border-r-4 border-primary'
                          : 'text-textColor hover:bg-background/50'
                      }`}
                    >
                      {theme.name === 'light' ? (
                        <IoIosSunny size={18} />
                      ) : (
                        <IoMoonOutline size={18} />
                      )}
                      <span className={`${isMobile ? 'hidden' : 'block'}`}>
                        Theme Settings
                      </span>
                    </button>

                    <button
                      onClick={() => handleSectionChange('user')}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        activeSection === 'user'
                          ? 'bg-primary/10 text-primary border-r-4 border-primary'
                          : 'text-textColor hover:bg-background/50'
                      }`}
                    >
                      <LuUser size={18} />
                      <span className={`${isMobile ? 'hidden' : 'block'}`}>
                        User Settings
                      </span>
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-col flex-1">
                  {/* Content Header (for non-mobile) */}
                  {!isMobile && (
                    <div className="flex items-center justify-end p-4 border-b border-border">
                      <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-sec_background text-textColor hover:bg-primary transition-colors"
                      >
                        <IoMdClose size={20} />
                      </button>
                    </div>
                  )}

                  {/* Scrollable Content with AnimatePresence for content transitions */}
                  <motion.div
                    layout // Add layout animation to content container
                    className={`flex-1 overflow-auto p-6 ${isMobile ? 'h-full' : 'max-h-[calc(85vh-80px-60px)]'}`}
                  >
                    <AnimatePresence mode="wait">
                      {activeSection === 'ai' && (
                        <motion.div
                          key="ai-settings"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AIConfigSettings ref={aiConfigRef} />
                        </motion.div>
                      )}
                      {activeSection === 'wallet' && (
                        <motion.div
                          key="wallet-settings"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <WalletSettings ref={walletSettingsRef} />
                        </motion.div>
                      )}
                      {activeSection === 'theme' && (
                        <motion.div
                          key="theme-settings"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ThemeSettings ref={themeSettingsRef} />
                        </motion.div>
                      )}
                      {activeSection === 'user' && (
                        <motion.div
                          key="user-settings"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <UserSettings ref={userSettingsRef} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Footer (Always Visible) */}
                  <div className="p-4 border-t border-border justify-end flex">
                    <button
                      onClick={onDoneClicked}
                      className="px-4 py-2 bg-primary text-textColor rounded-lg hover:bg-primaryDark transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
