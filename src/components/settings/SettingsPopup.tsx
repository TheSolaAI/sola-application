import { useState, useEffect, FC, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosSunny, IoMdClose } from 'react-icons/io';
import { IoMoonOutline } from 'react-icons/io5';
import { FaWallet } from 'react-icons/fa';
import { RiRobot2Line, RiLockLine } from 'react-icons/ri';
import useThemeManager from '../../models/ThemeManager.ts';
import { useSettingsHandler } from '../../models/SettingsHandler.ts';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { AIConfigSettings, AIConfigSettingsRef } from './AiConfigSettings.tsx';

export const SettingsModal: FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  // Global State Management
  const { theme, setTheme } = useThemeManager();
  const { updateSettings } = useSettingsHandler();
  const { linkEmail, unlinkEmail, user } = usePrivy();

  // Local state
  const [localTheme, setLocalTheme] = useState<string>(theme.name);
  const [activeSection, setActiveSection] = useState<string>('ai');

  // refs
  const aiConfigRef = useRef<AIConfigSettingsRef>(null);

  // Effect to handle body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle section change
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

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
              className={`bg-background overflow-hidden ${
                isMobile
                  ? 'w-full h-full'
                  : 'w-full max-w-4xl h-auto max-h-[85vh] rounded-2xl shadow-xl'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex h-full">
                {/* Vertical Sidebar Navigation */}
                <div className="w-64 border-r border-border bg-sec_background flex-shrink-0">
                  {/* Header in Sidebar */}
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-xl font-bold text-textColor">
                      Settings
                    </h2>
                    {isMobile && (
                      <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-sec_background text-textColor hover:bg-primary transition-colors"
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
                      <span>AI Configuration</span>
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
                      <span>Wallet Settings</span>
                    </button>

                    <button
                      onClick={() => handleSectionChange('privacy')}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        activeSection === 'privacy'
                          ? 'bg-primary/10 text-primary border-r-4 border-primary'
                          : 'text-textColor hover:bg-background/50'
                      }`}
                    >
                      <RiLockLine size={18} />
                      <span>Privacy Settings</span>
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
                      <span>Theme Settings</span>
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-col flex-1 overflow-hidden">
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

                  {/* Content Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* AI Configuration Section */}
                    {activeSection === 'ai' && <AIConfigSettings />}

                    {/* Wallet Settings Section */}
                    {activeSection === 'wallet' && (
                      <div className="space-y-6"></div>
                    )}

                    {/* Privacy Settings Section */}
                    {activeSection === 'privacy' && (
                      <div className="space-y-6"></div>
                    )}

                    {/* Theme Settings Section */}
                    {activeSection === 'theme' && (
                      <div className="space-y-6"></div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-border flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-primary text-textColor rounded-lg
                      hover:bg-primaryDark transition-colors"
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
