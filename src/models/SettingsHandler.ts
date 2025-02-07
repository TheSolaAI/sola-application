import { create } from 'zustand';
import { ApiClient, apiClient } from '../api/ApiClient.ts';
import { API_URLS } from '../config/api_urls.ts';
import { userSettingsResponse } from '../types/response.ts';
import useThemeManager from './ThemeManager.ts';
import { toast } from 'sonner';
import { UpdateUserSettingsRequest } from '../types/request.ts';

interface SettingsHandler {
  getSettings: () => Promise<void>;

  /**
   * Gets all settings from their respective handles and updates the server with the new settings.
   * Returns a boolean indicating if the update was successful.
   */
  updateSettings: () => Promise<boolean>;
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
      } else {
        toast.error('Failed to fetch settings.');
      }
    },

    updateSettings: async (): Promise<boolean> => {
      // Collect settings from all the handlers
      const settings: UpdateUserSettingsRequest = {
        theme: useThemeManager.getState().theme.name,
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
