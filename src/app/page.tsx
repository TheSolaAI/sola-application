'use client';

import OnboardingHeader from '@/app/_components/onboarding/OnboardingHeader';
import BackgroundPattern from '@/app/_components/onboarding/BackgroundPatterns';
import Hero from '@/app/_components/onboarding/Hero';
import BentoGrid from '@/app/_components/onboarding/BentoGrid';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useIsMobile from '@/utils/isMobile';
import { usePwaStatus } from '@/hooks/usePwaStatus';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Footer from './_components/onboarding/Footer';

export default function Home() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isInstallPromptAvailable, promptInstall } = usePwaStatus();
  const [showMobileView, setShowMobileView] = useState(false);

  // Initialize login functionality
  const { login } = useLogin({
    onComplete: (params) => {
      console.log(params);
      router.push('/dashboard/chat');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Login failed. Please try again later.');
    },
  });
  const { ready, authenticated } = usePrivy();
  const disabled = !ready || authenticated;

  // Ensure mobile view state is reset when device type changes
  useEffect(() => {
    if (isMobile) {
      setShowMobileView(false);
    }
  }, [isMobile]);

  return (
    <div className="relative isolate bg-gradient-to-b from-gray-950 to-black min-h-screen w-full overflow-x-hidden">
      <BackgroundPattern />
      <OnboardingHeader login={login} disabled={disabled} />
      <main className="isolate">
        <AnimatePresence mode="wait">
          <Hero
            login={login}
            disabled={disabled}
            isMobile={isMobile}
            showMobileView={showMobileView}
            setShowMobileView={setShowMobileView}
            promptInstall={promptInstall}
            isInstallPromptAvailable={isInstallPromptAvailable}
          />
        </AnimatePresence>
        <BentoGrid />
      </main>
      <Footer />
    </div>
  );
}
