import { RegisterUserResponse } from '../types/database/responseTypes';
import { RegisterUser } from '../types/database/requstTypes';
import dbClient from './dbClient';

export const registerUser = async (
  user: RegisterUser,
  jwt: string,
): Promise<RegisterUserResponse | null> => {
  try {
    const response = await dbClient.post('auth/register/', user, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    console.log(response.data);
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
