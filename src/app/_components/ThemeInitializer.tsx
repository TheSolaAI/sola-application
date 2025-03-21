'use client';

import { useEffect } from 'react';
import useThemeManager from '@/store/ThemeManager';

export default function ThemeInitializer() {
  const { initThemeManager } = useThemeManager();

  useEffect(() => {
    initThemeManager();
  }, []);

  return null;
}
