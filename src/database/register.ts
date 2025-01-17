import { RegisterUser } from '../types/database/responseTypes';
import dbClient from './index';

export const registerUser = async (
  user: RegisterUser,
): Promise<RegisterUser | null> => {
  try {
    const response = await dbClient.post('/register', user);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
};
