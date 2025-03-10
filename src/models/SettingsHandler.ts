import { toast } from 'sonner';
import { create } from 'zustand';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { API_URLS } from '../config/api_urls.ts';
import { UserSettingsResponse } from '../types/response.ts';
import useThemeManager, { Theme } from './ThemeManager.ts';
import { UpdateUserSettingsRequest } from '../types/request.ts';
import { useSessionHandler } from './SessionHandler.ts';
import { useCreditHandler } from './CreditHandler.ts';
import { useUserHandler } from './UserHandler.ts';

interface SettingsHandler {
  getSettings: () => Promise<void>;

  /**
   * Gets all settings from their respective handles and updates the server with the new settings.
   * Returns a boolean indicating if the update was successful. Optionally specify the specific setting that is required to be updated.
   */
  updateSettings: (
    setting: 'all' | 'voice' | 'emotion' | 'theme' | 'custom_themes' | 'name',
  ) => Promise<boolean>;
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
        const customThemes: Theme[] = Array.isArray(response.data.custom_themes)
          ? response.data.custom_themes
          : [];
        useThemeManager.getState().populateCustomThemes(customThemes);
        useThemeManager
          .getState()
          .setTheme(
            useThemeManager.getState().availableThemes[response.data.theme],
          );
        useUserHandler.getState().setUserName(response.data.name);
        useUserHandler.getState().setProfilePic(response.data.profile_pic);
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
      setting: 'all' | 'voice' | 'emotion' | 'theme' | 'custom_themes' | 'name',
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
      if (setting === 'all' || setting === 'name') {
        data['name'] = useUserHandler.getState().name;
        data['profile_pic'] = useUserHandler.getState().profilePic;
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
  };
});
