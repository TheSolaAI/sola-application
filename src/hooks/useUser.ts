import { useCallback } from 'react';
import { getUserSettings, updateUserSetting } from '../api/userSettings';
import { UserSettings } from '../types/database/requstTypes';
import useAppState from '../models/AppState.ts';
import { UserSettingsResponse } from '../types/database/responseTypes';
import useThemeManager from '../models/ThemeManager.ts';
import { useTierStore } from '../models/TierHandler.ts';

const useUser = () => {
  const { setAiVoice, setAiEmotion, accessToken } = useAppState();
  const { setTheme } = useThemeManager();
  const { setTierAndCredits } = useTierStore();

  // Fetch user settings
  const fetchSettings =
    useCallback(async (): Promise<UserSettingsResponse | null> => {
      if (!accessToken) {
        console.error('Access token is required to fetch settings.');
        return null;
      }
      try {
        const settings = await getUserSettings(accessToken);
        if (settings) {
          setAiVoice(settings.voice_preference || 'sage');
          setAiEmotion(
            settings.emotion_choice || 'playfully cheeky and very sarcastic',
          );
          setTierAndCredits(settings.tiers, settings.credits_remaining);
        }
        return settings;
      } catch (error) {
        console.error('Error fetching user settings:', error);
        return null;
      }
    }, [accessToken]);

  // Patch user settings
  const updateSettings = useCallback(
    async (
      updatedSettings: UserSettings,
    ): Promise<UserSettingsResponse | null> => {
      if (!accessToken) {
        console.error('Access token is required to update settings.');
        return null;
      }
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        updatedSettings.theme && setTheme(updatedSettings.theme);
      }
      {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        updatedSettings.voice_preference &&
          setAiVoice(updatedSettings.voice_preference);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      updatedSettings.emotion_choice &&
        setAiEmotion(updatedSettings.emotion_choice);
      try {
        const updatedResponse = updateUserSetting(accessToken, updatedSettings);

        return updatedResponse;
      } catch (error) {
        console.error('Error updating user settings:', error);
        return null;
      }
    },
    [accessToken],
  );

  return { fetchSettings, updateSettings };
};

export default useUser;
