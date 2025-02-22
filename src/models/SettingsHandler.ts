import { create } from 'zustand';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { API_URLS } from '../config/api_urls.ts';
import { userSettingsResponse } from '../types/response.ts';
import useThemeManager from './ThemeManager.ts';
import { toast } from 'sonner';
import { UpdateUserSettingsRequest } from '../types/request.ts';
import { useSessionHandler } from './SessionHandler.ts';

interface SettingsHandler {
  getSettings: () => Promise<void>;

  /**
   * Gets all settings from their respective handles and updates the server with the new settings.
   * Returns a boolean indicating if the update was successful.
   */
  updateSettings: (emotion_choice?: string, theme?: string) => Promise<boolean>;
}

/**
 * The settings handler is responsible for fetching settings from the server and populating the information
 * in all the other handlers. It itself does not store any information.
 */
export const useSettingsHandler = create<SettingsHandler>(() => {
  return {
    getSettings: async (): Promise<void> => {
      const response = await apiClient.get<userSettingsResponse>(
        API_URLS.AUTH.SETTINGS.GET,
        undefined,
        'auth',
      );
      if (ApiClient.isApiResponse(response)) {
        // set all the settings in their respective handlers
        useThemeManager.getState().setTheme(response.data.theme);
        useSessionHandler.getState().setAiEmotion(response.data.emotion_choice);
        useSessionHandler.getState().setAiVoice(response.data.voice_preference);
      } else {
        toast.error('Failed to fetch settings.');
      }
    },

    updateSettings: async (
      emotion_choice?: string,
      theme?: string,
    ): Promise<boolean> => {
      const settings: UpdateUserSettingsRequest = {
        ...(emotion_choice !== undefined && { emotion_choice: emotion_choice }),
        ...(theme !== undefined && { theme: theme }),
      };
      const response = await apiClient.patch(
        API_URLS.AUTH.SETTINGS.UPDATE,
        settings,
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
