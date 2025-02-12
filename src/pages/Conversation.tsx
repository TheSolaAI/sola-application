import { SessionControls } from '../components/SessionControls.tsx';
import { useChatRoomHandler } from '../models/ChatRoomHandler.ts';
import React, { useEffect } from 'react';
import { ChatRoom } from '../types/chatRoom.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useChatMessageHandler } from '../models/ChatMessageHandler.ts';
import { SimpleMessageChatItem } from '../components/ui/message_items/SimpleMessageChatItem.tsx';
import { ChatContentType, ChatItem } from '../types/chatItem.ts';
import { useLayoutContext } from '../layout/LayoutProvider.tsx';
import useThemeManager from '../models/ThemeManager.ts';
import { hexToRgb } from '../utils/hexToRGB.ts';

const Conversation = () => {
  const navigate = useNavigate();
  const { theme } = useThemeManager();
  const { audioIntensity } = useLayoutContext();

  const primaryRGB = hexToRgb(theme.primary);
  const primaryDarkRGB = hexToRgb(theme.primaryDark);

  /**
   * Global state
   */
  const { setCurrentChatRoom, rooms, currentChatRoom, allRoomsLoaded } =
    useChatRoomHandler();
  const { messages, currentChatItem } = useChatMessageHandler();

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

  /**
   * The primary render function. If provided a chatItem, it returns the React component that should be rendered
   */
  const renderMessageItem = (
    chatItem: ChatItem<ChatContentType>,
    index: number,
  ): React.ReactNode => {
    if (chatItem.content.type === 'simple_message') {
      return <SimpleMessageChatItem key={index} props={chatItem.content} />;
    } else {
      <></>;
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full">
      <div className="flex-1 min-h-[calc(100vh-1rem)] overflow-y-auto w-full">
        {messages.map((message, index) => {
          return renderMessageItem(message, index);
        })}
        {/* render the current chat item here*/}
        {currentChatItem && renderMessageItem(currentChatItem, -1)}
      </div>
      {/* Session Controls wrapper */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-center w-full p-4 pb-6 animate-wave transition-all duration-[5000]"
        style={{
          background: `linear-gradient(to top, rgba(${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}, ${0.5 + 1.5 * audioIntensity}), rgba(${primaryDarkRGB.r}, ${primaryDarkRGB.g}, ${primaryDarkRGB.b}, ${0.3 + 1.2 * audioIntensity}), transparent)`,
          transition: 'background 0.1s linear',
        }}
      >
        <SessionControls />
      </div>
    </div>
  );
};

export default Conversation;
