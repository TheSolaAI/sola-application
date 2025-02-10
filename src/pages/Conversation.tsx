import { SessionControls } from '../components/SessionControls.tsx';
import { useChatRoomHandler } from '../models/ChatRoomHandler.ts';
import { useEffect } from 'react';
import { ChatRoom } from '../types/chatRoom.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Conversation = () => {
  const navigate = useNavigate();

  /**
   * Global state
   */
  const { setCurrentChatRoom, rooms, currentChatRoom } = useChatRoomHandler();

  /**
   * Current Route
   */
  const pathParts = window.location.pathname.split('/');
  const chatRoomId = pathParts[pathParts.length - 1];

  useEffect(() => {
    if (chatRoomId) {
      const numericChatRoomId = Number(chatRoomId); // Convert to number
      if (!isNaN(numericChatRoomId)) {
        // isNan check before find
        const foundRoom = rooms.find(
          (room: ChatRoom) => room.id === numericChatRoomId,
        );
        if (foundRoom) {
          setCurrentChatRoom(foundRoom);
        } else {
          toast.error('Chat not Found');
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [chatRoomId]);

  /**
   * This useEffect will automatically navigate the user to the respective chat room based on the
   * currentChatRoom state if they are not already there
   */
  useEffect(() => {
    if (currentChatRoom) {
      navigate(`/c/${currentChatRoom.id}`);
    }
  }, [currentChatRoom]);

  return (
    <div className="relative flex flex-col w-full h-full">
      <div className="flex-1 min-h-[calc(100vh-1rem)] overflow-y-auto w-full"></div>

      {/* Session Controls wrapper */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center w-full p-4 pb-6 bg-gradient-to-t from-primaryDark/20  to-transparent">
        <SessionControls />
      </div>
    </div>
  );
};

export default Conversation;
