// src/app/dashboard/chat/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { ChatProvider } from '@/providers/ChatContextProvider';
import ChatMessages from '../_components/ChatMessages';
import ChatControlsWrapper from '../_components/ChatControlsWrapper';

export default function Chat() {
  const { id } = useParams();
  const { rooms, setCurrentChatRoom, currentChatRoom } = useChatRoomHandler();

  // Set current room based on URL parameter
  useEffect(() => {
    if (!currentChatRoom && id && rooms.length > 0) {
      const roomId = parseInt(id as string);
      const currentRoom = rooms.find((room) => room.id === roomId);

      if (currentRoom) {
        setCurrentChatRoom(currentRoom);
      }
    }
  }, [id, rooms, currentChatRoom, setCurrentChatRoom]);

  return (
    <ChatProvider roomId={id as string}>
      <div className="flex-1 w-full h-full">
        <div className="relative w-full h-full">
          <ChatMessages />
          <ChatControlsWrapper />
        </div>
      </div>
    </ChatProvider>
  );
}
