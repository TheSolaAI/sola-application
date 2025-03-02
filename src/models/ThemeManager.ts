import { create, StateCreator } from 'zustand';
import themeJSONRaw from '../config/themes.json';
import { useSettingsHandler } from './SettingsHandler';
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
  theme: Theme; // Current active theme
  availableThemes: Record<string, Theme>; // All themes (default + custom)
  initThemeManager: () => void; // Loads local storage theme, then defaults
  populateCustomThemes: (customThemes: Theme[]) => void; // Adds server-fetched custom themes
  setTheme: (theme: Theme) => void; // Sets and applies a theme
  addCustomTheme: (theme: Theme) => void; // Adds a new custom theme
  getCustomThemes: () => Theme[]; // Returns only custom themes
}

// Helper to convert hex to RGB for CSS variables
const hexToRGB = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
};

// Apply theme by updating CSS variables
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.style.setProperty(
    '--color-baseBackground',
    hexToRGB(theme.baseBackground),
  );
  root.style.setProperty('--color-background', hexToRGB(theme.background));
  root.style.setProperty(
    '--color-backgroundContrast',
    hexToRGB(theme.backgroundContrast),
  );
  root.style.setProperty(
    '--color-sec_background',
    hexToRGB(theme.sec_background),
  );
  root.style.setProperty('--color-surface', hexToRGB(theme.surface));
  root.style.setProperty('--color-textColor', hexToRGB(theme.textColor));
  root.style.setProperty(
    '--color-textColorContrast',
    hexToRGB(theme.textColorContrast),
  );
  root.style.setProperty('--color-secText', hexToRGB(theme.secText));
  root.style.setProperty('--color-border', hexToRGB(theme.border));
  root.style.setProperty('--color-primary', hexToRGB(theme.primary));
  root.style.setProperty('--color-primaryDark', hexToRGB(theme.primaryDark));
  root.style.setProperty(
    '--color-dashboardBackground',
    hexToRGB(theme.dashboardBackground),
  );
};

const ThemeHandler: StateCreator<ThemeStore> = (set, get) => {
  // Load default themes from themes.json
  const defaultThemes: Record<string, Theme> = Object.fromEntries(
    Object.entries(themeJSON).map(([name, theme]) => [
      name,
      { name, ...theme } as Theme,
    ]),
  );

  return {
    // Initial state: Default to light, will be overridden by initThemeManager
    theme: defaultThemes['light'],
    availableThemes: defaultThemes,

    // Initialize theme manager
    initThemeManager: () => {
      // 1. Load theme from local storage immediately
      const storedThemeName = localStorage.getItem('theme');
      let initialTheme = defaultThemes['light']; // Fallback

      if (storedThemeName) {
        const storedTheme = JSON.parse(
          localStorage.getItem(`${storedThemeName}-data`) || '{}',
        );
        if (storedTheme && storedTheme.name) {
          initialTheme = storedTheme;
          applyTheme(initialTheme);
        }
      }
      // 2. Set default themes from themes.json
      set({
        theme: initialTheme,
        availableThemes: { ...defaultThemes },
      });

      // Apply the initial theme (in case it wasn’t from storage)
      applyTheme(initialTheme);
    },

    // Populate custom themes from server
    populateCustomThemes: (customThemes: Theme[]) => {
      const updatedThemes = {
        ...get().availableThemes,
        ...Object.fromEntries(customThemes.map((theme) => [theme.name, theme])),
      };

      set({ availableThemes: updatedThemes });

      // 3. Check if current theme exists, revert to light if not
      const currentTheme = get().theme;
      if (!updatedThemes[currentTheme.name]) {
        const lightTheme = updatedThemes['light'];
        set({ theme: lightTheme });
        applyTheme(lightTheme);
        localStorage.setItem('theme', 'light');
        localStorage.setItem('light-data', JSON.stringify(lightTheme));
        // update the user settings on the server
        useSettingsHandler.getState().updateSettings('theme');
      }
    },

    // Set and apply a theme
    setTheme: (theme: Theme) => {
      set({ theme });
      applyTheme(theme);
      // Persist to local storage
      localStorage.setItem('theme', theme.name);
      localStorage.setItem(`${theme.name}-data`, JSON.stringify(theme));
      // update server settings of custom theme
      // TODO: Update as soon as server is patched
      useSettingsHandler.getState().updateSettings('theme');
    },

    // Add a custom theme
    addCustomTheme: (theme: Theme) => {
      const updatedThemes = {
        ...get().availableThemes,
        [theme.name]: theme,
      };
      set({ availableThemes: updatedThemes });
    },

    // Get only custom themes
    getCustomThemes: () => {
      const allThemes = get().availableThemes;
      return Object.values(allThemes).filter(
        (theme) => !Object.keys(themeJSON).includes(theme.name),
      );
    },
  };
};

const useThemeManager = create<ThemeStore>(ThemeHandler);
export default useThemeManager;
