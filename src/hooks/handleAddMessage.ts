import { useCallback } from 'react';
import { useRoomStore } from '../store/zustand/RoomState';
import { CreateRoom } from '../types/database/requstTypes';
import { MessageCard } from '../types/messageCard';
import useAppState from '../store/zustand/AppState';
import { createRoom, sendRoomMessage } from '../api/chatService';
import { useNavigate } from 'react-router-dom';

const useChatHandler = () => {
  const {
    currentRoomId,
    setCurrentRoomId,
    setMessageList,
    appendRoom,
    isCreatingRoom,
    setIsCreatingRoom,
  } = useRoomStore();
  const { accessToken } = useAppState();
  const navigate = useNavigate();

  const createChatRoom = useCallback(
    async (roomDetails: CreateRoom) => {
      if (!accessToken) return null;

      try {
        const response = await createRoom(accessToken, roomDetails);
        appendRoom(response.data);
        setMessageList(() => []);
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
        name: Math.floor(Math.random() * 1000000).toString(),
        session_id: Math.random().toString(),
      };

      try {
        let roomId = currentRoomId;

        if (!currentRoomId && roomDetails) {
          if (!isCreatingRoom) {

            const roomResponse = await createChatRoom(roomDetails);

            if (!roomResponse) {
              console.error('Failed to create room.');
              return;
            }

            roomId = roomResponse.id;
            setIsCreatingRoom(true);
            navigate(`/c/${roomId}`);
          }
        }

        if (roomId) {
          console.log(roomId);
          await sendMessage(roomId, message);
        }
      } catch (error) {
        console.error('Error in handleAddMessage:', error);
      }
    },
    [
      currentRoomId,
      createChatRoom,
      sendMessage,
      setMessageList,
      navigate,
      isCreatingRoom,
      setIsCreatingRoom,
    ],
  );

  const handleAddAiTranscript = useCallback(
    async (message: MessageCard) => {
      const roomDetails: CreateRoom = {
        name: Math.floor(Math.random() * 1000000).toString(),
        session_id: Math.random().toString(),
      };

      try {
        let roomId = currentRoomId;

        if (!currentRoomId && roomDetails) {
          if (!isCreatingRoom) {

            console.log('roomID', roomId, 'roomdetails', roomDetails);
            const roomResponse = await createChatRoom(roomDetails);

            if (!roomResponse) {
              console.error('Failed to create room.');
              return;
            }

            roomId = roomResponse.id;
            setIsCreatingRoom(true);
            navigate(`/c/${roomId}`);
          }
        }

        if (roomId) {
          console.log(roomId);
          await sendMessage(roomId, message);
        }
      } catch (error) {
        console.error('Error in handleAddMessage:', error);
      }
    },
    [
      currentRoomId,
      createChatRoom,
      sendMessage,
      setMessageList,
      navigate,
      isCreatingRoom,
      setIsCreatingRoom,
    ],
  );

  return {
    handleAddMessage,
    handleAddAiTranscript,
    createChatRoom,
    sendMessage,
  };
};

export default useChatHandler;
