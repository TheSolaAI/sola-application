import dbClient from '.';
import { UserSettings } from '../types/database/responseTypes';

export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const response = await dbClient.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

export const updateUserSetting = async (): Promise<UserSettings | null> => {
  try {
    const response = await dbClient.patch('/settings');
    return response.data;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};
