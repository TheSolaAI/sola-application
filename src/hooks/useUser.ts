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
          settings.theme && setTheme(settings.theme);
          settings.voice_preference && setAiVoice(settings.voice_preference);
          settings.emotion_choices && setAiEmotion(settings.emotion_choices);
        }
        return settings;
      } catch (error) {
        console.error('Error fetching user settings:', error);
        return null;
      }
    }, [accessToken, setTheme, setAiVoice, setAiEmotion]);

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
          updatedResponse.theme && setTheme(updatedResponse.theme);
          updatedResponse.voice_preference &&
            setAiVoice(updatedResponse.voice_preference);
          updatedResponse.emotion_choices &&
            setAiEmotion(updatedResponse.emotion_choices);
        }
        return updatedResponse;
      } catch (error) {
        console.error('Error updating user settings:', error);
        return null;
      }
    },
    [accessToken, setTheme, setAiVoice, setAiEmotion],
  );

  return { register, fetchSettings, updateSettings, setAccessToken };
};

export default useUser;
