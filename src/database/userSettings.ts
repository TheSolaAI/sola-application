import dbClient from '.';
import { UserSettingsResponse } from '../types/database/responseTypes';
import { UserSettings } from '../types/database/requstTypes';

export const getUserSettings = async (
  jwt: string,
): Promise<UserSettingsResponse | null> => {
  try {
    const response = await dbClient.get('/settings/', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error(
        'Server error:',
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      console.error('Network error or no response from server:', error.request);
    } else {
      console.error('Error registering user:', error.message);
    }
    return null;
  }
};

export const updateUserSetting = async (
  jwt: string,
  user: UserSettings,
): Promise<UserSettingsResponse | null> => {
  try {
    const response = await dbClient.patch('/settings/update/', user, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error(
        'Server error:',
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      console.error('Network error or no response from server:', error.request);
    } else {
      console.error('Error registering user:', error.message);
    }
    return null;
  }
};
