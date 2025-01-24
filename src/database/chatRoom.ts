import dbClient from '.';
import { CreateRoom, RoomMessages } from '../types/database/requstTypes';
import {
  ChatMessagesResponse,
  ChatRoom,
  SendMessageResponse,
} from '../types/database/responseTypes';

export const getRooms = async (jwt: string): Promise<ChatRoom[] | null> => {
  try {
    const response = await dbClient.get('chatrooms/', {
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

export const createRoom = async (
  jwt: string,
  roomDetails: CreateRoom,
): Promise<ChatRoom | null> => {
  try {
    const response = await dbClient.post('chatrooms/', roomDetails, {
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

export const getRoomMessages = async (
  jwt: string,
  roomId: number,
  params?: RoomMessages,
): Promise<ChatMessagesResponse | null> => {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) {
    query.append('limit', params.limit.toString());
  }
  if (params?.offset !== undefined) {
    query.append('offset', params.offset.toString());
  }

  const url = `chatrooms/${roomId}/messages/?${query.toString()}`;

  try {
    const response = await dbClient.get(url, {
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

export const sendRoomMessage = async (
  jwt: string,
  roomId: number,
  message: string | JSON,
): Promise<SendMessageResponse | null> => {
  try {
    const response = await dbClient.post(
      `chatrooms/${roomId}/messages/`,
      message,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    );
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
