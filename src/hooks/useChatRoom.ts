import { useState, useCallback } from 'react';
import {
  getRooms as fetchRooms,
  getRoomMessages as fetchRoomMessages,
  delRoom as deleteRoom,
} from '../api/chatService';
import { RoomMessages } from '../types/database/requstTypes';
import { useRoomStore } from '../models/RoomState.ts';
import useAppState from '../models/AppState.ts';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import useChatState from '../models/ChatState.ts';

export const useChat = () => {
  const {
    setRooms,
    removeRoom,
    setCurrentRoomChat,
    setCurrentRoomId,
    setMessageList,
  } = useRoomStore();
  const {
    getPeerConnection,
    dataChannel,
    setIsSessionActive,
    setDataChannel,
    resetMute,
    setPeerConnection,
  } = useChatState();
  const { accessToken, setAccessToken } = useAppState();
  const { getAccessToken } = usePrivy();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageLoadingError, setMessageLoadingError] = useState<string | null>(
    null,
  );

  function stopSession() {
    const pc = getPeerConnection();

    if (dataChannel) {
      dataChannel.close();
    }
    if (pc) {
      pc.close();
      setPeerConnection(null);
    }

    setIsSessionActive(false);
    setDataChannel(null);
    resetMute();
    console.log("delete stop session executed")
  }

  const ensureAccessToken = useCallback(async (): Promise<string | null> => {
    if (accessToken) {
      return accessToken;
    }
    try {
      const newAccessToken = await getAccessToken();
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (err: any) {
      console.error('Failed to get access token:', err.message);
      setError('Failed to get access token');
      return null;
    }
  }, [accessToken, getAccessToken, setAccessToken]);

  const getRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = await ensureAccessToken();
    if (!token) {
      return null;
    }
    try {
      const response = await fetchRooms(token);
      setRooms(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, [ensureAccessToken, setRooms]);

  const delRooms = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      const token = await ensureAccessToken();
      if (!token) {
        return null;
      }
      try {
        const response = await deleteRoom(token, id);
        removeRoom(id);
        stopSession();
        navigate('/');
      } catch (err: any) {
        setError(err.message || 'Failed to delete room');
      } finally {
        setLoading(false);
      }
    },
    [ensureAccessToken],
  );

  const getRoomMessages = useCallback(
    async (roomId: string, params?: RoomMessages) => {
      setLoading(true);
      setError(null);
      setMessageLoadingError(null);
      const token = await ensureAccessToken();
      if (!token) {
        setError('Access token not found.');
        return null;
      }

      try {
        const response = await fetchRoomMessages(token, roomId, params);
        console.log('Room Messages: ', response.data);
        setCurrentRoomChat(response.data);
        setMessageList((prev) => {
          if (!response.data || !Array.isArray(response.data.results)) {
            console.error('Invalid response format:', response);
            return prev;
          }
          const newMessages = response.data.results.map(
            (result) => result.message,
          );
          return [...prev, ...newMessages.reverse()];
        });
        console.log('success :');
        setCurrentRoomId(roomId);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch messages');
        setMessageLoadingError(err.message || 'Failed to fetch messages');
        setCurrentRoomId(null);
      } finally {
        setLoading(false);
      }
      return null;
    },
    [ensureAccessToken, setCurrentRoomChat, setCurrentRoomId],
  );

  return {
    loading,
    error,
    messageLoadingError,
    getRooms,
    getRoomMessages,
    delRooms,
  };
};
