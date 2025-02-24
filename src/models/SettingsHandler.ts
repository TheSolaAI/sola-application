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
   * Returns a boolean indicating if the update was successful.
   */
  updateSettings: () => Promise<boolean>;

  /**
   * This function only updates the credits in the user settings. Due to it being called often it is separted
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
      if (ApiClient.isApiResponse(response)) {
        // set all the settings in their respective handlers
        useThemeManager.getState().setTheme(response.data.theme);
        useSessionHandler.getState().setAiEmotion(response.data.emotion_choice);
        useSessionHandler.getState().setAiVoice(response.data.voice_preference);
        useCreditHandler
          .getState()
          .setCurrentCredits(response.data.credits_remaining);
      } else {
        toast.error('Failed to fetch settings.');
      }
    },

    updateSettings: async (): Promise<boolean> => {
      const response = await apiClient.patch(
        API_URLS.AUTH.SETTINGS.UPDATE,
        {
          theme: useThemeManager.getState().theme.name,
          emotion_choice: useSessionHandler.getState().aiEmotion,
          voice_preference: useSessionHandler.getState().aiVoice,
        } as UpdateUserSettingsRequest,
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
