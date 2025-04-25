'use client';
import { FC, ReactNode, useEffect, useState, useCallback } from 'react';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { toast } from 'sonner';
import SessionVerificationModal from '@/app/dashboard/_components/SessionVerificationModal';
import { useSessionManagerHandler } from '@/store/SessionManagerHandler';
import { setTierVerificationResult } from '@/redux/features/user/tier'; // Ensure this path is correct
import { useAppDispatch, useAppSelector } from '@/redux/hook';

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
  /**
   * Global State Management
   */
  const { currentChatRoom, previousChatRoom, isNewRoomCreated } =
    useChatRoomHandler();
  const { initChatMessageHandler } = useChatMessageHandler();
  const {
    showVerifyHoldersPopup,
    setShowVerifyHoldersPopup,
    verifyUserTierStatus,
  } = useSessionManagerHandler();

  const tierResult = useAppSelector((state) => state.tier.userTier);
  const dispatch = useAppDispatch();

  /**
   * Local State
   */
  const [showVerifyHoldersCard, setShowVerifyHoldersCard] = useState(
    showVerifyHoldersPopup
  );

  const handleVerifyTier = useCallback(async () => {
    try {
      const result = await verifyUserTierStatus();
      dispatch(setTierVerificationResult(result));
      return result;
    } catch (error) {
      console.error('Error verifying tier:', error);
      toast.error('Failed to verify tier');
      return null;
    }
  }, [verifyUserTierStatus, dispatch]);

  useEffect(() => {
    handleVerifyTier();
  }, [handleVerifyTier]);

  useEffect(() => {
    if (tierResult && (!tierResult.tier || tierResult.tier <= 0)) {
      setShowVerifyHoldersPopup(true);
    }
  }, [tierResult, setShowVerifyHoldersPopup]);

  useEffect(() => {
    setShowVerifyHoldersCard(showVerifyHoldersPopup);
  }, [showVerifyHoldersPopup]);

  /**
   * Runs every time the current chat room changes and loads the chat messages of the room
   */
  useEffect(() => {
    if (!currentChatRoom || (!previousChatRoom && isNewRoomCreated)) return;
    // load the messages of the room asynchronously
    initChatMessageHandler();
  }, [
    currentChatRoom,
    previousChatRoom,
    isNewRoomCreated,
    initChatMessageHandler,
  ]);

  return (
    <div className="overflow-y-auto">
      {/* Session Verification Modal */}
      <SessionVerificationModal
        isOpen={showVerifyHoldersCard}
        onClose={() => setShowVerifyHoldersPopup(false)}
        onVerifyTier={handleVerifyTier}
        tierVerificationResult={tierResult}
      />

      {children}
    </div>
  );
};
