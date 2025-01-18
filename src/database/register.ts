import { RegisterUserResponse } from '../types/database/responseTypes';
import { RegisterUser } from '../types/database/requstTypes';
import dbClient from './index';

export const registerUser = async (
  user: RegisterUser,
  jwt: string,
): Promise<RegisterUserResponse | null> => {
  try {
    const response = await dbClient.post('/register', user, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
};
