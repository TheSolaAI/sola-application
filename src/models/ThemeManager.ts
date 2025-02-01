import { create, StateCreator } from 'zustand';
import themeJSONRaw from '../config/themes.json';

interface Theme {
  name: string;
  baseTheme: 'light' | 'dark';
  baseBackground: `#${string}`;
  background: `#${string}`;
  backgroundContrast: `#${string}`;
  sec_background: `#${string}`;
  surface: `#${string}`;
  textColor: `#${string}`;
  textColorContrast: `#${string}`;
  secText: `#${string}`;
  border: `#${string}`;
  primary: `#${string}`;
  primaryDark: `#${string}`;
}

type ThemeJSON = Record<string, Omit<Theme, 'name'>>;
const themeJSON: ThemeJSON = themeJSONRaw as ThemeJSON;

interface ThemeStore {
  theme: Theme;
  availableThemes: Record<string, Theme>;
  initThemeManager: () => void;
  setTheme: (themeName: string) => void;
  resolveTheme: (themeName: string) => Theme;
}

const ThemeManager: StateCreator<ThemeStore> = (set, get) => {
  // Clone themes and enforce correct typing
  const availableThemes: Record<string, Theme> = Object.fromEntries(
    Object.entries(themeJSON).map(([name, theme]) => [
      name,
      { name, ...theme } as Theme, // Enforce correct type
    ]),
  );

  return {
    theme: availableThemes['light'],
    availableThemes,

    initThemeManager: () => {
      let savedTheme = 'system';

      try {
        savedTheme = localStorage.getItem('theme') || 'light';
      } catch (error) {
        console.warn('LocalStorage not accessible, using default theme.');
      }

      const resolvedTheme = get().resolveTheme(savedTheme);
      set({ theme: resolvedTheme });

      document.documentElement.className = resolvedTheme.name;
    },

    setTheme: (themeName: string) => {
      const resolvedTheme = get().resolveTheme(themeName);

      try {
        localStorage.setItem('theme', themeName);
      } catch (error) {
        console.warn('Could not save theme to LocalStorage.');
      }

      set({ theme: resolvedTheme });
      document.documentElement.className = resolvedTheme.name;
    },

    resolveTheme: (themeName: string) => {
      if (themeName === 'system' && typeof window !== 'undefined') {
        const prefersDark = window.matchMedia?.(
          '(prefers-color-scheme: dark)',
        ).matches;
        return (
          availableThemes[prefersDark ? 'dark' : 'light'] ||
          availableThemes['light']
        );
      }

      return availableThemes[themeName] || availableThemes['light'];
    },
  };
};

const useThemeManager = create<ThemeStore>(ThemeManager);

export default useThemeManager;
