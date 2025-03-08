'use client'

import { useState } from 'react';
import TopBar from './TopBar';
import MobileContent from './MobileContent';
import MainContent from './MainContent';
import useIsMobile from '@/utils/isMobile';
import useThemeManager from "@/store/ThemeManager";


export default function Onboarding() {
  const [isMobileLogin, setIsMobileLogin] = useState(false);
  const isMobile = useIsMobile();
  const {theme} = useThemeManager();
  console.log(theme);

  return (
    <div className="bg-[var(--color-background)] h-screen overflow-hidden flex flex-col gap-4 items-center justify-center">
      <TopBar
        isMobileLogin={isMobileLogin}
        setIsMobileLogin={setIsMobileLogin}
      />
      {!isMobile && isMobileLogin ? <MobileContent /> : <MainContent />}
    </div>
  );
}