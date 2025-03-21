'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';

export const ChatNavigationHandler = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentChatRoom = useChatRoomHandler.getState().currentChatRoom;
  const prevRoomIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Don't navigate if:
    // 1. No current chat room is selected
    // 2. We're already on the correct route
    // 3. The room ID hasn't actually changed
    // 4. The chat is new chat
    if (!currentChatRoom) return;
    console.log(currentChatRoom);

    const currentRoomId = currentChatRoom.id;
    if (prevRoomIdRef.current === currentRoomId) return;

    const targetPath = `/dashboard/chat/${currentRoomId}`;
    if (pathname === targetPath) return;

    // Update the ref
    prevRoomIdRef.current = currentRoomId;

    // Navigate to the chat room
    if (currentRoomId) {
      console.log(`Navigating to chat room: ${currentRoomId}`);
      router.push(targetPath);
    }
  }, [currentChatRoom, pathname, router]);

  return null;
};
