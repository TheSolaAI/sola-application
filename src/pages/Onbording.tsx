import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { AwesomeButton } from 'react-awesome-button';
import { FaGithub, FaMobileAlt } from 'react-icons/fa';
import { HiComputerDesktop } from 'react-icons/hi2';
import useThemeManager from '../models/ThemeManager';
import useIsMobile from '../utils/isMobile';
import { useState, useRef } from 'react';
import { Dropdown } from '../components/general/DropDown';
import 'react-awesome-button/dist/styles.css';
import '../css/buttons.css';

function Onboarding() {
  const { login, authenticated, ready } = usePrivy();
  const { theme } = useThemeManager();
  const isMobile = useIsMobile();

  const disableLogin = !ready || (ready && authenticated);
  const [isMobileLogin, setIsMobileLogin] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  const renderTopBar = () => (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute top-2 w-[60%] rounded-2xl p-3 bg-backgroundContrast bg-opacity-90 z-10 flex flex-row justify-between gap-2"
    >
      <div className="flex flex-row h-full self-center items-center gap-x-3">
        <img
          src="/sola_black_logo.svg"
          alt="logo"
          className={`h-8 w-8 rounded-xl fill-textColor ${
            theme.name === 'dark'
              ? 'bg-light-backgroundContrast'
              : 'bg-background'
          }`}
        />
        <a
          href="/"
          className="hidden text-xl font-semibold text-textColorContrast sm:block"
        >
          Sola AI
        </a>
      </div>
      <div className="flex gap-2 items-center">
        {!isMobile && (
          <AwesomeButton
            className="h-12"
            type="secondary"
            onPress={() => setIsMobileLogin(!isMobileLogin)}
          >
            {isMobileLogin ? (
              <div className="flex flex-row items-center justify-center">
                <HiComputerDesktop className="mr-2" />
                Web App
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center">
                <FaMobileAlt className="mr-2" />
                Mobile
              </div>
            )}
          </AwesomeButton>
        )}
        <AwesomeButton
          className="flex flex-row h-12"
          type="secondary"
          href="https://github.com/TheSolaAI/sola-application"
        >
          <FaGithub className="mr-2" />
          <span>Github</span>
        </AwesomeButton>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    const contentProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.4, ease: 'easeOut' },
    };

    if (!isMobile && isMobileLogin) {
      return (
        <motion.div {...contentProps} className="max-w-4xl px-6 sm:px-8 py-12">
          <div className="text-center space-y-2 mt-24">
            <div className="text-3xl sm:text-4xl font-semibold text-textColor">
              Take Sola AI Anywhere with You!
            </div>
            <div className="text-lg text-secText text-center">
              Download the app for the best on-the-go experience!
            </div>
          </div>
          <motion.div
            {...contentProps}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="flex mt-12 w-full justify-center"
          >
            <img
              alt="App screenshot"
              src="/qr.png"
              className="w-90 h-90 rounded-lg shadow-xl"
            />
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div {...contentProps} className="max-w-4xl px-6 sm:px-8 py-12">
        <div className="text-center space-y-6 mt-24">
          <div className="text-3xl sm:text-4xl font-semibold text-textColor">
            Welcome to Sola AI. Voice Assistant on Solana.
          </div>
          <div className="text-lg text-secText text-center">
            Redefine your on-chain experience through voice commands.
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-y-4 gap-x-6 mt-10 items-center">
            <AwesomeButton
              onReleased={() => login({ loginMethods: ['email', 'wallet'] })}
              disabled={disableLogin}
              type="secondary"
            >
              {isMobile ? 'Get Started' : 'Login to Sola AI'}
            </AwesomeButton>

            {isMobile ? (
              <div className="relative" ref={downloadRef}>
                <button
                  onClick={() => setIsDownloadOpen(true)}
                  className="px-6 py-3 text-textColorContrast text-lg font-semibold rounded-lg bg-backgroundContrast hover:bg-surface hover:text-textColor transition duration-300 shadow-md"
                >
                  Download
                </button>

                <Dropdown
                  isOpen={isDownloadOpen}
                  onClose={() => setIsDownloadOpen(false)}
                  anchorEl={downloadRef.current}
                  title="Download Options"
                  mobileTitle="Download Sola AI"
                  direction="down"
                  horizontalAlignment="left"
                >
                  <div className="space-y-2 my-4">
                    {[
                      {
                        number: '1',
                        text: 'Tap the "Menu" button in your browser',
                      },
                      { number: '2', text: 'Tap "Add to Home Screen"' },
                    ].map((step, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 rounded-lg bg-gray-800"
                      >
                        <span className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 text-white font-semibold">
                          {step.number}
                        </span>
                        <p className="text-white">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </Dropdown>
              </div>
            ) : (
              <a
                href="https://docs.solaai.xyz/"
                className="text-sm font-semibold text-textColor"
              >
                Read Docs <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
        <motion.div
          {...contentProps}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="mt-12"
        >
          <img
            alt="App screenshot"
            src="/app-screenshot.png"
            className="w-full rounded-lg shadow-xl"
          />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="bg-sec_background h-screen overflow-hidden flex flex-col gap-4 items-center justify-center">
      {renderTopBar()}
      {renderContent()}
    </div>
  );
}

export default Onboarding;
