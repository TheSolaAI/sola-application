'use client';

import { create, StateCreator } from 'zustand';
import themeJSONRaw from '../config/themes.json';

export interface Theme {
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
  dashboardBackground: `#${string}`;
}

type ThemeJSON = Record<string, Omit<Theme, 'name'>>;
const themeJSON: ThemeJSON = themeJSONRaw as ThemeJSON;

interface ThemeStore {
  theme: Theme;
  availableThemes: Record<string, Theme>;
  initialized: boolean; // Add an initialization flag
  initThemeManager: () => void;
  populateCustomThemes: (customThemes: Theme[]) => void;
  setTheme: (theme: Theme) => void;
  addCustomTheme: (theme: Theme) => void;
  getCustomThemes: () => Theme[];
  deleteCustomTheme: (theme: Theme) => void;
}

// Helper to convert hex to RGB for CSS variables
const hexToRGB = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
};

// Apply theme by updating CSS variables - safely check for document
const applyTheme = (theme: Theme) => {
  // Only run on the client side
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty(
    '--color-baseBackground',
    hexToRGB(theme.baseBackground)
  );
  root.style.setProperty('--color-background', hexToRGB(theme.background));
  root.style.setProperty(
    '--color-backgroundContrast',
    hexToRGB(theme.backgroundContrast)
  );
  root.style.setProperty(
    '--color-sec_background',
    hexToRGB(theme.sec_background)
  );
  root.style.setProperty('--color-surface', hexToRGB(theme.surface));
  root.style.setProperty('--color-textColor', hexToRGB(theme.textColor));
  root.style.setProperty(
    '--color-textColorContrast',
    hexToRGB(theme.textColorContrast)
  );
  root.style.setProperty('--color-secText', hexToRGB(theme.secText));
  root.style.setProperty('--color-border', hexToRGB(theme.border));
  root.style.setProperty('--color-primary', hexToRGB(theme.primary));
  root.style.setProperty('--color-primaryDark', hexToRGB(theme.primaryDark));
  root.style.setProperty(
    '--color-dashboardBackground',
    hexToRGB(theme.dashboardBackground)
  );
};

const ThemeHandler: StateCreator<ThemeStore> = (set, get) => {
  // Load default themes from themes.json
  const defaultThemes: Record<string, Theme> = Object.fromEntries(
    Object.entries(themeJSON).map(([name, theme]) => [
      name,
      { name, ...theme } as Theme,
    ])
  );

  return {
    theme: defaultThemes['light'],
    availableThemes: defaultThemes,
    initialized: false,

    initThemeManager: () => {
      // Skip if already initialized or not in browser
      if (get().initialized || typeof window === 'undefined') return;

      // 1. Load theme from local storage immediately
      let initialTheme = defaultThemes['light']; // Fallback

      try {
        const storedThemeName = localStorage.getItem('theme');

        if (storedThemeName) {
          const storedThemeData = localStorage.getItem(
            `${storedThemeName}-data`
          );
          if (storedThemeData) {
            const storedTheme = JSON.parse(storedThemeData);
            if (storedTheme && storedTheme.name) {
              initialTheme = storedTheme;
            }
          }
        }
      } catch (error) {
        console.error('Error loading theme from localStorage:', error);
      }

      // Apply the theme
      applyTheme(initialTheme);

      set({
        theme: initialTheme,
        availableThemes: { ...defaultThemes },
        initialized: true,
      });

      console.log('Theme initialized:', initialTheme.name);
    },

    populateCustomThemes: (customThemes: Theme[]) => {
      if (!customThemes || customThemes.length === 0) return;
      const updatedThemes = {
        ...get().availableThemes,
        ...Object.fromEntries(customThemes.map((theme) => [theme.name, theme])),
      };
      set({ availableThemes: updatedThemes });

      // Check if current theme exists, revert to light if not
      const currentTheme = get().theme;
      if (!updatedThemes[currentTheme.name]) {
        const lightTheme = updatedThemes['light'];
        set({ theme: lightTheme });
        applyTheme(lightTheme);

        // Only save to localStorage on client side
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', 'light');
          localStorage.setItem('light-data', JSON.stringify(lightTheme));
        }
      }
    },

    setTheme: (theme: Theme) => {
      // check if the theme exists just in case or default to the light theme
      if (!get().availableThemes[theme.name]) {
        theme = get().availableThemes['light'];
      }
      set({ theme });
      applyTheme(theme);

      // Persist to local storage (only on client)
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme.name);
        localStorage.setItem(`${theme.name}-data`, JSON.stringify(theme));
      }
    },

    addCustomTheme: (theme: Theme) => {
      const updatedThemes = {
        ...get().availableThemes,
        [theme.name]: theme,
      };
      set({ availableThemes: updatedThemes });
      // Additional server-side logic would go here
    },

    getCustomThemes: () => {
      const allThemes = get().availableThemes;
      return Object.values(allThemes).filter(
        (theme) => !Object.keys(themeJSON).includes(theme.name)
      );
    },

    deleteCustomTheme: (theme: Theme) => {
      const updatedThemes = { ...get().availableThemes };
      delete updatedThemes[theme.name];
      set({ availableThemes: updatedThemes });
      // Additional server-side logic would go here
    },
  };
};

const useThemeManager = create<ThemeStore>(ThemeHandler);
export default useThemeManager;
