import { useCallback, useState } from 'react';
import { registerUser } from '../api/register';
import { getUserSettings, updateUserSetting } from '../api/userSettings';
import { RegisterUser, UserSettings } from '../types/database/requstTypes';
import useAppState from '../store/zustand/AppState';
import {
  RegisterUserResponse,
  UserSettingsResponse,
} from '../types/database/responseTypes';

const useUser = () => {
  const { setTheme, setAiVoice, setAiEmotion, accessToken } = useAppState();

  // Register a user
  const register = useCallback(
    async (user: RegisterUser): Promise<RegisterUserResponse | null> => {
      if (!accessToken) {
        console.error('Access token is required for registration.');
        return null;
      }
      try {
        const registerUserResponse = await registerUser(user, accessToken);
        return registerUserResponse;
      } catch (error) {
        console.error('Error registering user:', error);
        return null;
      }
    },
    [accessToken],
  );

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
          setTheme(settings.theme ?? 'light');
          setAiVoice(settings.voice_preference || 'sage');
          setAiEmotion(
            settings.emotion_choice || 'playfully cheeky and very sarcastic',
          );
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
        updatedSettings.theme && setTheme(updatedSettings.theme);
      }
      {
        updatedSettings.voice_preference &&
          setAiVoice(updatedSettings.voice_preference);
      }
      updatedSettings.emotion_choice && setAiEmotion(
        updatedSettings.emotion_choice,
      );
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

  return { register, fetchSettings, updateSettings };
};

export default useUser;
