import { useSettingsHandler } from '@/store/SettingsHandler';
import useThemeManager from '@/store/ThemeManager';
import { ToolResult } from '@/types/tool';

export const changeThemeTool = (args: any): ToolResult => {
  if (!args.themeName) {
    return {
      success: true,
      data: { themeName: 'Theme Picker Opened', autoSwitched: false },
      error: undefined,
    };
  } else if (useThemeManager.getState().availableThemes[args.themeName]) {
    useThemeManager
      .getState()
      .setTheme(useThemeManager.getState().availableThemes[args.themeName]);
    useSettingsHandler.getState().updateSettings('theme');
    return {
      success: true,
      data: { themeName: args.themeName, autoSwitched: true },
      error: undefined,
    };
  } else {
    return {
      success: true,
      data: { themeName: args.themeName, autoSwitched: false },
      error: undefined,
    };
  }
};
