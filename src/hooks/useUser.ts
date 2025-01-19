import { useCallback, useState } from 'react';
import { registerUser } from '../database/register';
import { getUserSettings, updateUserSetting } from '../database/userSettings';
import { RegisterUser, UserSettings } from '../types/database/requstTypes';
import useAppState from '../store/zustand/AppState';
import {
  RegisterUserResponse,
  UserSettingsResponse,
} from '../types/database/responseTypes';

const useUser = () => {
  const { setTheme, setAiVoice, setAiEmotion } = useAppState();
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
            settings.emotion_choices || 'playfully cheeky and very sarcastic',
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
      try {
        const updatedResponse = await updateUserSetting(
          accessToken,
          updatedSettings,
        );
        if (updatedResponse) {
          setTheme(updatedResponse.theme ?? 'light');
          setAiVoice(updatedResponse.voice_preference || 'sage');
          setAiEmotion(
            updatedResponse.emotion_choices ||
              'playfully cheeky and very sarcastic',
          );
        }
        return updatedResponse;
      } catch (error) {
        console.error('Error updating user settings:', error);
        return null;
      }
    },
    [accessToken],
  );

  return { register, fetchSettings, updateSettings, setAccessToken };
};

export default useUser;
