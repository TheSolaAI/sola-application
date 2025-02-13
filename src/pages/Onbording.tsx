/**
 * Onboarding Component
 *
 * This React component serves as the onboarding page for Sola AI. It provides:
 *
 * - A top bar with the Sola AI logo and a GitHub link.
 * - A hero section introducing Sola AI with a brief description.
 * - Login button that authenticates users via Privy.
 * - A link to the documentation for more information.
 * - A visual representation of the app with a screenshot.
 *
 * Usage:
 * ```tsx
 * import Onboarding from './Onboarding';
 *
 * function App() {
 *   return <Onboarding />;
 * }
 * ```
 */

import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import 'react-awesome-button/dist/styles.css';
import '../css/buttons.css';
import { AwesomeButton } from 'react-awesome-button';
import { FaGithub } from 'react-icons/fa';

function Onboarding() {
  const { login, authenticated, ready } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);

  return (
    <div className="bg-background h-screen overflow-hidden flex flex-col gap-4 items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-2 w-[60%] rounded-2xl p-3 bg-backgroundContrast bg-opacity-90 z-10 flex flex-row justify-between gap-2"
      >
        <div
          className={'flex flex-row h-full self-center items-center gap-x-3'}
        >
          <img
            src="/sola_black_logo.svg"
            alt={'logo'}
            className="h-8 w-8 rounded-xl fill-textColor bg-baseBackground"
          />
          <a
            href="/"
            className="hidden text-xl font-semibold text-textColorContrast sm:block"
          >
            Sola AI
          </a>
        </div>
        <AwesomeButton
          className="flex flex-row h-12"
          type="secondary"
          href="https://github.com/TheSolaAI/sola-application"
        >
          <FaGithub className="mr-2" />
          <span>Github</span>
        </AwesomeButton>{' '}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        className="max-w-4xl px-6 sm:px-8 py-12"
      >
        <div className="text-center space-y-6 mt-24">
          <div className="text-3xl sm:text-4xl font-semibold text-textColor">
            Welcome to Sola AI. Voice Assistant on Solana.
          </div>
          <div className="text-lg text-secText text-center">
            Redefine your on-chain experience through voice commands.
          </div>
          <div className="flex justify-center gap-x-6 mt-10 items-center">
            <AwesomeButton
              onReleased={() => login({ loginMethods: ['email', 'wallet'] })}
              disabled={disableLogin}
              type="secondary"
            >
              Login to Sola AI
            </AwesomeButton>
            <a
              href="https://docs.solaai.xyz/"
              className="text-sm font-semibold text-textColor"
            >
              Read Docs <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
    </div>
  );
}

export default Onboarding;
