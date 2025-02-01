import dbClient from './dbClient.ts';
import { CreateRoom, RoomMessages } from '../types/database/requstTypes';
import {
  ChatMessagesResponse,
  ChatRoom,
  SendMessageResponse,
} from '../types/database/responseTypes';

export const getRooms = (jwt: string) =>
  dbClient.get<ChatRoom[]>('chatrooms/', {
    headers: { Authorization: `Bearer ${jwt}` },
  });

export const delRoom = (jwt: string, id: string) =>
  dbClient.delete(`chatrooms/${id}/`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

export const createRoom = (jwt: string, roomDetails: CreateRoom) =>
  dbClient.post<ChatRoom>('chatrooms/', roomDetails, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

export const getRoomMessages = (
  jwt: string,
  roomId: string,
  params?: RoomMessages,
) => {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.offset) query.append('offset', params.offset.toString());
  if (!params?.limit && !params?.offset) {
    query.append('offset', '0');
    query.append('limit', '10');
  }

  return dbClient.get<ChatMessagesResponse>(
    `chatrooms/${roomId}/messages/?${query.toString()}`,
    { headers: { Authorization: `Bearer ${jwt}` } },
  );
};

export const sendRoomMessage = (
  jwt: string,
  roomId: string,
  message: string | object,
) =>
  dbClient.post<SendMessageResponse>(
    `chatrooms/${roomId}/messages/`,
    { message: message },
    { headers: { Authorization: `Bearer ${jwt}` } },
  );
