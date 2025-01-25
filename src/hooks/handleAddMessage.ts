import { useCallback } from 'react';
import { useRoomStore } from '../store/zustand/RoomState';
import { CreateRoom } from '../types/database/requstTypes';
import { MessageCard } from '../types/messageCard';
import useAppState from '../store/zustand/AppState';
import { createRoom, sendRoomMessage } from '../api/chatService';
import { useNavigate } from 'react-router-dom'; 

const useChatHandler = () => {
  const { currentRoomId, setCurrentRoomId, setMessageList, appendRoom } =
    useRoomStore();
  const { accessToken } = useAppState();
  const navigate = useNavigate(); 

  const createChatRoom = useCallback(
    async (roomDetails: CreateRoom) => {
      if (!accessToken) return null;

      try {
        const response = await createRoom(accessToken, roomDetails);
        appendRoom(response.data);
        setMessageList(() => [])
        setCurrentRoomId(response.data.id);
        return response.data;
      } catch (error) {
        console.error('Error creating room:', error);
        return null;
      }
    },
    [appendRoom, setCurrentRoomId, accessToken],
  );

  const sendMessage = useCallback(
    async (roomId: string, message: string | object) => {
      if (!accessToken) return null;

      try {
        await sendRoomMessage(accessToken, roomId, message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [accessToken],
  );

  const handleAddMessage = useCallback(
    async (message: MessageCard) => {
      setMessageList((prev) => [...prev, message]);

      const roomDetails: CreateRoom = {
        name: Math.random().toString(),
        session_id: Math.random().toString(),
      };

      try {
        let roomId = currentRoomId;

        if (!roomId && roomDetails) {
          const roomResponse = await createChatRoom(roomDetails);
          if (!roomResponse) {
            console.error('Failed to create room.');
            return;
          }
          roomId = roomResponse.id;
          navigate(`/c/${roomId}`);
        }

        if (roomId) {
          await sendMessage(roomId, message);
        }
      } catch (error) {
        console.error('Error in handleAddMessage:', error);
      }
    },
    [currentRoomId, createChatRoom, sendMessage, setMessageList, navigate],
  );

  return { handleAddMessage, createChatRoom, sendMessage };
};

export default useChatHandler;
