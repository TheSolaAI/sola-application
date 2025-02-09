import { FC, ReactNode, useEffect } from 'react';
import { useChatRoomHandler } from '../ChatHandler.ts';
import { useChatMessageHandler } from '../ChatMessageHandler.ts';
import { useSessionHandler } from '../SessionHandler.ts';
import { toast } from 'sonner';
import { useUserHandler } from '../UserHandler.ts';
import { EventProvider } from './EventProvider.tsx';

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
  /**
   * Global State Management
   */
  const { ready } = useUserHandler();
  const { currentChatRoom } = useChatRoomHandler();
  const { initChatMessageHandler } = useChatMessageHandler();
  const {
    initSessionHandler,
    setDataStream,
    setPeerConnection,
    setMediaStream,
    muted,
    mediaStream,
  } = useSessionHandler();

  /**
   * Runs when the application launches and starts the session with OpenAI. Even when room switches
   * the session is not restarted as there is no context switch.
   */
  useEffect(() => {
    const init = async () => {
      const token = await initSessionHandler();
      if (token === null) return; // if the token is not available, do not proceed
      const peerConnection = new RTCPeerConnection();
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      peerConnection.ontrack = (e) => (audioEl.srcObject = e.streams[0]);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      // mute the media stream based on the muted state
      mediaStream.getAudioTracks()[0].enabled = !muted;
      peerConnection.addTrack(mediaStream.getTracks()[0]);
      const dataChannel = peerConnection.createDataChannel('oai-events');
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      if (!process.env.OPENAI_API_URL) {
        throw new Error('OPENAI_API_URL is not set');
      }
      const sdpResponse = await fetch(process.env.OPENAI_API_URL, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/sdp',
        },
      });
      if (!sdpResponse.ok) {
        toast.error('Failed to start session');
        throw new Error('Failed to send SDP');
      } else {
        const sdp = await sdpResponse.text();
        await peerConnection.setRemoteDescription({ type: 'answer', sdp }); // confim handshake
        setMediaStream(mediaStream);
        setDataStream(dataChannel);
        setPeerConnection(peerConnection);
      }
    };
    if (ready) {
      init();
    }
  }, [ready]);

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
  }, [muted]);

  /**
   * Runs every time the current chat room changes and loads the chat messages of the room
   */
  useEffect(() => {
    if (!currentChatRoom) return; // ignore the case that the chat room is set to null at the start of the app
    // load the messages of the room asynchronously
    initChatMessageHandler();
  }, [currentChatRoom]);

  return (
    <EventProvider>
      <>{children}</>
    </EventProvider>
  );
};
