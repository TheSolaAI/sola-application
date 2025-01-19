import dbClient from '.';
import { UserSettingsResponse } from '../types/database/responseTypes';
import { UserSettings } from '../types/database/requstTypes';

export const getUserSettings = async (
  jwt: string,
): Promise<UserSettingsResponse | null> => {
  try {
    const response = await dbClient.get('/settings', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

export const updateUserSetting = async (
  jwt: string,
  user: UserSettings,
): Promise<UserSettingsResponse | null> => {
  try {
    const response = await dbClient.patch('/settings', user, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};
