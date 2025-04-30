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
import { AnimatePresence } from 'framer-motion';
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
      </main>
      <Footer />
    </div>
  );
}
