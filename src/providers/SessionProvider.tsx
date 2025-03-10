'use client';
import { FC, ReactNode, useEffect } from 'react';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { useSessionHandler } from '@/store/SessionHandler';
import { toast } from 'sonner';
import { useUserHandler } from '@/store/UserHandler';
import { EventProvider } from '@/providers/EventProvider';
import { useLayoutContext } from '@/providers/LayoutProvider';

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
  const {
    initSessionHandler,
    setDataStream,
    setPeerConnection,
    setMediaStream,
    muted,
    mediaStream,
  } = useSessionHandler();
  const { audioEl, setAudioIntensity } = useLayoutContext();

  const setupAudioVisualizer = (audioEl: HTMLAudioElement | null) => {
    if (!audioEl) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(
      audioEl.srcObject as MediaStream
    );
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateGradient = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate the average volume
      const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const intensity = Math.min(volume / 255, 1);

      setAudioIntensity(intensity);

      requestAnimationFrame(updateGradient);
    };

    updateGradient();
  };

  /**
   * Runs when the application launches and starts the session with OpenAI. Even when room switches
   * the session is not restarted as there is no context switch.
   */
  useEffect(() => {
    // TODO: Add Check for the amount of credits the user has here. Add the credits amount as a dep in this hook
    const init = async () => {
      if (!audioEl) return;
      try {
        const token = await fetch('/api/openai/create-realtime-session');
        const data = await token.json();
        const EPHEMERAL_KEY = data.client_secret.value;
        console.log(EPHEMERAL_KEY);
        if (EPHEMERAL_KEY === null) return; // if the token is not available, do not proceed
        const peerConnection = new RTCPeerConnection();
        peerConnection.ontrack = (e) => {
          audioEl.srcObject = e.streams[0];
          setupAudioVisualizer(audioEl);
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // mute the media stream based on the muted state
        mediaStream.getAudioTracks()[0].enabled = !muted;
        peerConnection.addTrack(mediaStream.getTracks()[0]);
        const dataChannel = peerConnection.createDataChannel('oai-events');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        if (!process.env.NEXT_PUBLIC_OPENAI_API_URL) {
          throw new Error('OPENAI_API_URL is not set');
        }
        const sdpResponse = await fetch(
          process.env.NEXT_PUBLIC_OPENAI_API_URL,
          {
            method: 'POST',
            body: offer.sdp,
            headers: {
              Authorization: `Bearer ${EPHEMERAL_KEY}`,
              'Content-Type': 'application/sdp',
            },
          }
        );
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
      } catch (e) {
        console.log(e);
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
    // don't fetch when a new chat room is created or when the user is in dummy room
    if (!currentChatRoom || (!previousChatRoom && isNewRoomCreated)) return;
    // load the messages of the room asynchronously
    initChatMessageHandler();
  }, [currentChatRoom]);

  return (
    <EventProvider>
      <>{children}</>
    </EventProvider>
  );
};
