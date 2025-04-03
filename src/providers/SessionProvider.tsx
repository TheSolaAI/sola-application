'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useSessionHandler } from '@/store/SessionHandler';
import { toast } from 'sonner';
import { useUserHandler } from '@/store/UserHandler';
import { EventProvider } from '@/providers/EventProvider';
import { initializeTools } from '@/lib/initTools';
import { useSessionManager } from '@/hooks/useSessionManager';
import SessionVerificationModal from '@/app/dashboard/_components/SessionVerificationModal';
import { useSessionManagerHandler } from '@/store/SessionManagerHandler';

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
  /**
   * Global State Management
   */
  const { ready } = useUserHandler();
  const { currentChatRoom, previousChatRoom, isNewRoomCreated } =
    useChatRoomHandler();
  const { initChatMessageHandler } = useChatMessageHandler();
  const { mediaStream, muted } = useSessionHandler();
  const { establishConnection } = useSessionManager();
  const {
    showVerifyHoldersPopup,
    setShowVerifyHoldersPopup,
    sessionStatus,
    checkSessionAvailability,
    verifyUserTierStatus,
    getUserProvidedApiKey,
    setUserProvidedApiKey,
    clearUserProvidedApiKey,
  } = useSessionManagerHandler();

  /**
   * Local State
   */
  const [tierVerificationResult, setTierVerificationResult] = useState<{
    success: boolean;
    tier: number;
    totalSolaBalance: number;
    message?: string;
  } | null>(null);
  const [showVerifyHoldersCard, setShowVerifyHoldersCard] = useState(
    showVerifyHoldersPopup
  );

  /**
   * Initialize tools when the component mounts
   */
  useEffect(() => {
    initializeTools();
    console.log('Tools initialized in SessionProvider');
  }, []);

  useEffect(() => {
    setShowVerifyHoldersCard(showVerifyHoldersPopup);
  }, [showVerifyHoldersPopup]);

  /**
   * Mutes the media stream when the user chooses to mute the audio
   */
  useEffect(() => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !muted;
      }
      console.log('Muted:', audioTrack);
    }
  }, [muted, mediaStream]);

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

  /**
   * Runs when the application is ready to initialize the session with OpenAI
   */
  useEffect(() => {
    const initSession = async () => {
      if (!ready) return;

      try {
        const hasSessionsAvailable = await checkSessionAvailability();

        if (hasSessionsAvailable || getUserProvidedApiKey()) {
          await establishConnection();
        } else {
          setShowVerifyHoldersPopup(true);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        toast.error('Failed to initialize session');
      }
    };

    initSession();
  }, [ready]);

  /**
   * Handle tier verification
   */
  const handleVerifyTier = async () => {
    try {
      const result = await verifyUserTierStatus();
      setTierVerificationResult(result);
    } catch (error) {
      console.error('Error verifying tier:', error);
      toast.error('Failed to verify tier');
    }
  };

  /**
   * Handle connection from modal
   */
  const handleConnect = async () => {
    try {
      const success = await establishConnection();
      if (success) {
        setShowVerifyHoldersPopup(false);
      }
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect');
    }
  };

  return (
    <EventProvider>
      <div className="overflow-y-auto">
        {/* Session Verification Modal */}
        <SessionVerificationModal
          isOpen={showVerifyHoldersCard}
          onClose={() => setShowVerifyHoldersPopup(false)}
          sessionStatus={sessionStatus}
          onVerifyTier={handleVerifyTier}
          onConnect={handleConnect}
          tierVerificationResult={tierVerificationResult}
          userProvidedApiKey={getUserProvidedApiKey}
          onSetApiKey={setUserProvidedApiKey}
          onClearApiKey={clearUserProvidedApiKey}
        />

        {children}
      </div>
    </EventProvider>
  );
};
