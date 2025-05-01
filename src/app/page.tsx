'use client';

import OnboardingHeader from '@/app/_components/onboarding/OnboardingHeader';
import BackgroundPattern from '@/app/_components/onboarding/BackgroundPatterns';
import Hero from '@/app/_components/onboarding/Hero';
import BentoGrid from '@/app/_components/onboarding/BentoGrid';
import CountdownTimer from '@/app/_components/onboarding/CountdownTimer';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useIsMobile from '@/utils/isMobile';
import { usePwaStatus } from '@/hooks/usePwaStatus';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Footer from './_components/onboarding/Footer';
import Script from 'next/script';

export default function Home() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isInstallPromptAvailable, promptInstall } = usePwaStatus();
  const [showMobileView, setShowMobileView] = useState(false);
  const [isBeforeLaunch, setIsBeforeLaunch] = useState(true);
  const [secretClickCount, setSecretClickCount] = useState(0);

  const launchDate = new Date('2025-05-01T18:30:00+05:30');

  // Initialize login functionality
  const { login } = useLogin({
    onComplete: (params) => {
      router.push('/dashboard/chat');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Login failed. Please try again later.');
    },
  });
  const { ready, authenticated } = usePrivy();
  const disabled = !ready || authenticated || isBeforeLaunch;

  // Ensure mobile view state is reset when device type changes
  useEffect(() => {
    if (isMobile) {
      setShowMobileView(false);
    }
  }, [isMobile]);

  // Check if current date is before launch date
  useEffect(() => {
    const checkLaunchDate = () => {
      const now = new Date();
      setIsBeforeLaunch(now < launchDate);
    };

    checkLaunchDate();
    // Update every minute
    const intervalId = setInterval(checkLaunchDate, 60000);

    return () => clearInterval(intervalId);
  }, [launchDate]);

  // Initialize OneSignal notification setup
  const setupOneSignal = () => {
    if (typeof window !== 'undefined' && 'OneSignal' in window) {
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(function () {
        window.OneSignal.init({
          appId: '7b2eea96-5f4b-40b9-8f2d-c9a89a3a4aaf',
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        });
        window.OneSignal.isPushNotificationsEnabled((isEnabled: boolean) => {
          if (!isEnabled) {
            window.OneSignal.showSlidedownPrompt();
          }
        });

        window.OneSignal.sendTag('interested_in_launch', 'true');
      });
    }
  };

  // Setup OneSignal when component mounts
  useEffect(() => {
    if (isBeforeLaunch) {
      setupOneSignal();
    }
  }, [isBeforeLaunch]);

  // Handle subscription for launch notifications
  const handleSubscribeForLaunch = () => {
    if (typeof window !== 'undefined' && 'OneSignal' in window) {
      window.OneSignal.isPushNotificationsEnabled((isEnabled: boolean) => {
        if (isEnabled) {
          toast.success("You're subscribed to launch notifications!");
        } else {
          window.OneSignal.showNativePrompt();
          toast.info('Please allow notifications to get launch updates');
        }
      });
    } else {
      toast.error('Notification system not available');
    }
  };

  // Secret login handler for the notification text
  const handleSecretNotificationTextClick = () => {
    // Only allow this when before launch
    if (isBeforeLaunch) {
      setSecretClickCount((prev) => prev + 1);
      // Trigger login after 3 clicks
      if (secretClickCount === 2) {
        setSecretClickCount(0);
        login();
      }
    }
  };

  return (
    <div className="relative isolate bg-gradient-to-b from-gray-950 to-black min-h-screen w-full overflow-x-hidden">
      {/* OneSignal Script */}
      <Script
        src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
        async
        onLoad={setupOneSignal}
      />

      <BackgroundPattern />
      <OnboardingHeader login={login} disabled={disabled} />
      <main className="isolate">
        <CountdownTimer targetDate={launchDate} />

        <AnimatePresence mode="wait">
          <Hero
            login={login}
            disabled={disabled}
            isMobile={isMobile}
            showMobileView={showMobileView}
            setShowMobileView={setShowMobileView}
            promptInstall={promptInstall}
            isInstallPromptAvailable={isInstallPromptAvailable}
            isBeforeLaunch={isBeforeLaunch}
            onSubscribe={handleSubscribeForLaunch}
            onSecretTextClick={handleSecretNotificationTextClick}
          />
        </AnimatePresence>
        <BentoGrid />
        {/* Future Features Section */}
        <div className="py-16 sm:py-24 overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-center text-base/7 font-semibold text-indigo-400">
                Coming Soon
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-center text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
                Future Features Roadmap 🚀
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">
                We're constantly evolving. Here's what we're building next to
                take your experience to the next level.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-6 sm:mt-16 grid-cols-1 lg:grid-cols-3">
              {/* Advanced Wallet Analysis Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative h-full"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="absolute inset-px rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-700/20"></div>
                <div className="relative h-full flex flex-col overflow-hidden rounded-xl border border-white/10">
                  <div className="flex items-center justify-center h-24 bg-gradient-to-r from-violet-800/30 to-indigo-900/30">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(139, 92, 246, 0.5)',
                          '0 0 20px rgba(139, 92, 246, 0.7)',
                          '0 0 10px rgba(139, 92, 246, 0.5)',
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                    </motion.div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Advanced Wallet Analysis
                    </h3>
                    <p className="text-gray-300 mb-4 flex-grow">
                      Perform deep-dive analysis on your wallet assets,
                      dynamically manage your portfolio through voice commands,
                      and get AI-powered investment insights.
                    </p>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-indigo-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>Voice-controlled asset management</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-indigo-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>AI investment recommendations</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-indigo-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>Portfolio risk analysis and optimization</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Pump Fun Terminal Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative h-full"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="absolute inset-px rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-700/20"></div>
                <div className="relative h-full flex flex-col overflow-hidden rounded-xl border border-white/10">
                  <div className="flex items-center justify-center h-24 bg-gradient-to-r from-fuchsia-800/30 to-purple-900/30">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(217, 70, 239, 0.5)',
                          '0 0 20px rgba(217, 70, 239, 0.7)',
                          '0 0 10px rgba(217, 70, 239, 0.5)',
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    </motion.div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Pump Fun Terminal
                    </h3>
                    <p className="text-gray-300 mb-4 flex-grow">
                      A dedicated terminal with deep pump fun integration
                      designed for speed and accuracy, allowing for realtime
                      analysis and management without pressing a button.
                    </p>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-fuchsia-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>Realtime coin analysis</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-fuchsia-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>Voice-powered coin launching</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-fuchsia-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>Hands-free crypto management</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Developer Integration Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative h-full"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="absolute inset-px rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-700/20"></div>
                <div className="relative h-full flex flex-col overflow-hidden rounded-xl border border-white/10">
                  <div className="flex items-center justify-center h-24 bg-gradient-to-r from-cyan-800/30 to-blue-900/30">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(6, 182, 212, 0.5)',
                          '0 0 20px rgba(6, 182, 212, 0.7)',
                          '0 0 10px rgba(6, 182, 212, 0.5)',
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                        />
                      </svg>
                    </motion.div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Plugin Marketplace
                    </h3>
                    <p className="text-gray-300 mb-4 flex-grow">
                      A plug-and-play marketplace where developers can add their
                      own integrations and users can enhance their SOLA
                      experience with ecosystem-specific plugins.
                    </p>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-cyan-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>Simple developer API integration</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-cyan-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>Custom ecosystem connectors</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-cyan-400 flex-shrink-0">
                          ✦
                        </span>
                        <span>Voice-control for third-party apps</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
