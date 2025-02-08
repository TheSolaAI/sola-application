import { FC, ReactNode, useEffect } from 'react';
import { useChatRoomHandler } from '../ChatHandler.ts';
import { useChatMessageHandler } from '../ChatMessageHandler.ts';
import { useSessionHandler } from '../SessionHandler.ts';
import { toast } from 'sonner';

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
  /**
   * Global State Management
   */
  const { currentChatRoom } = useChatRoomHandler();
  const { initChatMessageHandler } = useChatMessageHandler();
  const { initSessionHandler, setDataStream, setPeerConnection } =
    useSessionHandler();

  /**
   * Runs when the application launches and starts the session with OpenAI. Even when room switches
   * the session is not restarted as there is no context switch.
   */
  useEffect(() => {
    const init = async () => {
      const token = await initSessionHandler();
      if (!token) return; // if the token is not available, do not proceed
      const peerConnection = new RTCPeerConnection();
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      peerConnection.ontrack = (e) => (audioEl.srcObject = e.streams[0]);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
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
      }
      const sdp = await sdpResponse.text();
      await peerConnection.setRemoteDescription({ type: 'answer', sdp }); // confim handshake
      setDataStream(dataChannel);
      setPeerConnection(peerConnection);

      // Send events to configure real time api
      dataChannel.send();
    };
    init();
  }, []);

  /**
   * Runs every time the current chat room changes and loads the chat messages of the room
   */
  useEffect(() => {
    if (!currentChatRoom) return; // ignore the case that the chat room is set to null at the start of the app
    // load the messages of the room asynchronously
    initChatMessageHandler();
  }, [currentChatRoom]);

  return <>{children}</>;
};
