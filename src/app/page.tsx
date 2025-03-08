'use client'

import { useEffect } from "react";
import useThemeManager from "@/store/ThemeManager";
import Onboarding from "@/app/_components/Onboarding";

export default function Home() {

  const {initThemeManager} = useThemeManager();

  /**
   * Add any code here that needs to run at the start of the application regardless of authentication status
   */
  useEffect(() => {
    initThemeManager();
  }, [initThemeManager]);

  return (
  <Onboarding />
  );
}
