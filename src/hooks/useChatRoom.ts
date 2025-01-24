import { useState, useCallback } from 'react';
import {
  getRooms as fetchRooms,
  createRoom as createRoomAPI,
  getRoomMessages as fetchRoomMessages,
  sendRoomMessage as sendMessageAPI,
} from '../api/chatService';
import { CreateRoom, RoomMessages } from '../types/database/requstTypes';
import { useRoomStore } from '../store/zustand/RoomState';
import useAppState from '../store/zustand/AppState';

// TODO: Add sooner to messages or warnings

export const useChat = () => {
  const { setRooms, appendRoom, setCurrentRoomChat } = useRoomStore();
  const { accessToken } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!accessToken) {
      console.warn('jwt not found');
      return null;
    }
    try {
      const response = await fetchRooms(accessToken);
      setRooms(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const createRoom = useCallback(
    async (roomDetails: CreateRoom) => {
      setLoading(true);
      setError(null);
      if (!accessToken) {
        console.warn('jwt not found');
        return null;
      }
      try {
        const response = await createRoomAPI(accessToken, roomDetails);
        appendRoom(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to create room');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const getRoomMessages = useCallback(
    async (roomId: number, params?: RoomMessages) => {
      setLoading(true);
      setError(null);
      if (!accessToken) {
        console.warn('jwt not found');
        return null;
      }
      try {
        const response = await fetchRoomMessages(accessToken, roomId, params);
        console.log(response.data);
        setCurrentRoomChat(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const sendMessage = useCallback(
    async (roomId: number, message: string | JSON) => {
      setLoading(true);
      setError(null);
      if (!accessToken) {
        console.warn('jwt not found');
        return null;
      }
      try {
        const response = await sendMessageAPI(accessToken, roomId, message);
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  return {
    loading,
    error,
    getRooms,
    createRoom,
    getRoomMessages,
    sendMessage,
  };
};
