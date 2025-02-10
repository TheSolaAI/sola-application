import { SessionControls } from '../components/SessionControls.tsx';
import { useChatRoomHandler } from '../models/ChatRoomHandler.ts';
import { useEffect } from 'react';
import { ChatRoom } from '../types/chatRoom.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';

const Conversation = () => {
  const navigate = useNavigate();

  /**
   * Global state
   */
  const { setCurrentChatRoom, rooms, currentChatRoom, allRoomsLoaded } =
    useChatRoomHandler();
  const { messages } = useChatMessageHandler();

  /**
   * Current Route
   */
  const pathParts = window.location.pathname.split('/');
  const chatRoomId = pathParts[pathParts.length - 1];

  useEffect(() => {
    if (chatRoomId && allRoomsLoaded) {
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
    }
  }, [chatRoomId, allRoomsLoaded]);

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
      <div className="flex-1 min-h-[calc(100vh-1rem)] overflow-y-auto w-full">
        {/*{messages.map((message) => (*/}
        {/*  <div key={message.id} className="flex justify-center w-full">*/}
        {/*    <div className="flex flex-col w-full max-w-[600px]">*/}
        {/*      <div className="flex justify-end">*/}
        {/*        <div className="flex items-center gap-2 p-2 bg-primary rounded-tl-xl rounded-br-xl">*/}
        {/*          <p className="text-sm font-medium text-textColor">You</p>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*      <div className="flex justify-end">*/}
        {/*        <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-tl-xl rounded-br-xl">*/}
        {/*          <p className="text-sm font-light text-textColor">*/}
        {/*            {message?.content.text}*/}
        {/*          </p>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*))}*/}
      </div>
      {/* Session Controls wrapper */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center w-full p-4 pb-6 bg-gradient-to-t from-primaryDark/20  to-transparent">
        <SessionControls />
      </div>
    </div>
  );
};

export default Conversation;
