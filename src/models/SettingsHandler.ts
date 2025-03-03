import { toast } from 'sonner';
import { create } from 'zustand';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { API_URLS } from '../config/api_urls.ts';
import { UserSettingsResponse } from '../types/response.ts';
import useThemeManager from './ThemeManager.ts';
import { UpdateUserSettingsRequest } from '../types/request.ts';
import { useSessionHandler } from './SessionHandler.ts';
import { useCreditHandler } from './CreditHandler.ts';

interface SettingsHandler {
  getSettings: () => Promise<void>;

  /**
   * Gets all settings from their respective handles and updates the server with the new settings.
   * Returns a boolean indicating if the update was successful. Optionally specify the specific setting that is required to be updated.
   */
  updateSettings: (
    setting: 'all' | 'voice' | 'emotion' | 'theme' | 'custom_themes',
  ) => Promise<boolean>;

  /**
   * This function only updates the credits in the user settings. Due to it being called often it is separated
   * from the updateSettings function.
   */
  updateCredits: () => Promise<void>;
}

/**
 * The settings handler is responsible for fetching settings from the server and populating the information
 * in all the other handlers. It itself does not store any information.
 */
export const useSettingsHandler = create<SettingsHandler>(() => {
  return {
    getSettings: async (): Promise<void> => {
      const response = await apiClient.get<UserSettingsResponse>(
        API_URLS.AUTH.SETTINGS.GET,
        undefined,
        'auth',
      );
      if (ApiClient.isApiResponse<UserSettingsResponse>(response)) {
        useThemeManager
          .getState()
          .populateCustomThemes(response.data.custom_themes);
        useThemeManager
          .getState()
          .setTheme(
            useThemeManager.getState().availableThemes[response.data.theme],
          );
        useSessionHandler.getState().setAiEmotion(response.data.emotion_choice);
        useSessionHandler.getState().setAiVoice(response.data.voice_preference);
        useCreditHandler
          .getState()
          .setCurrentCredits(response.data.credits_remaining);
      } else {
        toast.error('Failed to fetch settings.');
      }
    },

    updateSettings: async (
      setting: 'all' | 'voice' | 'emotion' | 'theme' | 'custom_themes',
    ): Promise<boolean> => {
      const data: UpdateUserSettingsRequest = {};
      if (setting === 'all' || setting === 'theme') {
        data['theme'] = useThemeManager.getState().theme.name;
      }
      if (setting === 'all' || setting === 'emotion') {
        data['emotion_choice'] = useSessionHandler.getState().aiEmotion;
      }
      if (setting === 'all' || setting === 'voice') {
        data['voice_preference'] = useSessionHandler.getState().aiVoice;
      }
      if (setting === 'all' || setting === 'custom_themes') {
        // in this case we set both the new custom theme that was added as well as setting the current users theme
        data['custom_themes'] = useThemeManager.getState().getCustomThemes();
        data['theme'] = useThemeManager.getState().theme.name;
      }
      const response = await apiClient.patch(
        API_URLS.AUTH.SETTINGS.UPDATE,
        data,
        'auth',
      );
      if (ApiClient.isApiResponse(response)) {
        return true;
      } else {
        toast.error('Failed to update settings.');
        return false;
      }
    },

    updateCredits: async (): Promise<void> => {
      const response = await apiClient.patch<UserSettingsResponse>(
        API_URLS.AUTH.SETTINGS.UPDATE,
        { credits_remaining: useCreditHandler.getState().credits },
        'auth',
      );
      if (ApiClient.isApiResponse(response)) {
        return;
      } else {
        toast.error('Failed to fetch settings.');
      }
    },
  };
});
