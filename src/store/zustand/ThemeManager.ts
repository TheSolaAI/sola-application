import { StateCreator, create } from 'zustand';
import themeJSON from '../../constants/themes.json';

interface Theme {
  name: string;
  background: string;
  sec_background: string;
  textColor: string;
  secTextColor: string;
}

/**
 * JSON representation of the theme.
 */
interface ThemeJSON {
  background: string;
  sec_background: string;
  textColor: string;
  secTextColor: string;
}

interface ThemeStore {
  theme: Theme;
  availableThemes: Record<string, Theme>;
  initManager: () => void;
  setTheme: (themeName: string) => void;
  resolveTheme: (themeName: string) => Theme; // convert theme name into theme object
}
const ThemeManager: StateCreator<ThemeStore> = (set, get) => ({
  theme: {
    name: 'light',
    background: '#FFFFFF',
    sec_background: '#F8F9FA',
    textColor: '#1F2937',
    secTextColor: '#6B7280',
  },
  availableThemes: {},

  initManager: () => {
    // parse the json and popualte availble themes
    const themes = JSON.parse(JSON.stringify(themeJSON));
    const results = {};
    Object.entries(themes).forEach((entry) => {
      const themeEntry = entry as [string, ThemeJSON];
      const theme: Theme = {
        name: themeEntry[0],
        background: themeEntry[1].background,
        sec_background: themeEntry[1].sec_background,
        textColor: themeEntry[1].textColor,
        secTextColor: themeEntry[1].secTextColor,
      };
      // @ts-ignore
      results[theme.name] = theme;
    });
    set({ availableThemes: results });
    const resolvedTheme = get().resolveTheme(
      localStorage.getItem('theme') || 'system',
    );
    set({
      theme: resolvedTheme,
    });

    get().setTheme(resolvedTheme.name);
  },

  // Set and apply a theme.
  setTheme: (themeName: string) => {
    const { resolveTheme, availableThemes } = get();
    const themeNames = Object.keys(availableThemes); // Get all theme names dynamically.

    // Resolve the theme from the available themes.
    const resolvedTheme = resolveTheme(themeName);

    // Update localStorage and Zustand state.
    localStorage.setItem('theme', themeName);
    set({ theme: resolvedTheme });

    // Dynamically manage classList for the document.
    themeNames.forEach((theme) =>
      document.documentElement.classList.remove(theme),
    );
    document.documentElement.classList.add(resolvedTheme.name);
  },

  // Resolve a theme dynamically.
  resolveTheme: (themeName: string) => {
    const { availableThemes } = get();

    if (themeName === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      return availableThemes[systemTheme];
    }

    return availableThemes[themeName] || availableThemes['light'];
  },
});

const useThemeManager = create<ThemeStore>(ThemeManager);

export default useThemeManager;
