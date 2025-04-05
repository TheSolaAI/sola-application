// src/hooks/useSessionManager.ts
'use client';

import { toast } from 'sonner';
import { useSessionHandler } from '@/store/SessionHandler';
import { useLayoutContext } from '@/providers/LayoutProvider';
import { useCallback } from 'react';
import { useSessionManagerHandler } from '@/store/SessionManagerHandler';
import { useUserHandler } from '@/store/UserHandler';

interface SessionManagerProps {
  establishConnection: () => Promise<boolean>;
}

export function useSessionManager(): SessionManagerProps {
  const { setDataStream, setPeerConnection, setMediaStream, muted } =
    useSessionHandler();
  const { audioEl, setAudioIntensity } = useLayoutContext();

  // Use the Zustand store instead of local React state
  const { setSessionStatus, getUserProvidedApiKey } =
    useSessionManagerHandler();

  /**
   * Sets up audio visualization for the AI assistant's voice
   */
  const setupAudioVisualizer = useCallback(
    (audioEl: HTMLAudioElement | null) => {
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
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const intensity = Math.min(volume / 255, 1);
        setAudioIntensity(intensity);
        requestAnimationFrame(updateGradient);
      };

      updateGradient();
    },
    [setAudioIntensity]
  );

  /**
   * Establishes a connection to OpenAI using WebRTC
   * Uses either the ephemeral key from the server or a user-provided key
   */
  const establishConnection = useCallback(async (): Promise<boolean> => {
    if (!audioEl) {
      toast.error('Audio element not available');
      return false;
    }

    setSessionStatus('connecting');

    try {
      // Check if user has provided their own API key
      const userApiKey = getUserProvidedApiKey();
      let apiKey: string;

      if (userApiKey) {
        // Use user-provided key
        apiKey = userApiKey;
        console.log('Using user-provided OpenAI API key');
      } else {
        // Get ephemeral key from server
        const authToken = useUserHandler.getState().authToken;
        if (!authToken) {
          throw new Error('Authentication token not available');
        }

        // Get ephemeral key from server with auth token in headers
        const tokenResponse = await fetch(
          '/api/openai/create-realtime-session',
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.error || 'Failed to create session token');
        }

        const tokenData = await tokenResponse.json();
        apiKey = tokenData.client_secret.value;

        if (!apiKey) {
          throw new Error('Failed to obtain API key');
        }
      }

      // Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection();

      // Handle incoming audio track
      peerConnection.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        setupAudioVisualizer(audioEl);
      };

      // Request user microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Apply mute state to media stream
      mediaStream.getAudioTracks()[0].enabled = !muted;

      // Add audio track to peer connection
      peerConnection.addTrack(mediaStream.getTracks()[0]);

      // Create data channel for messages
      const dataChannel = peerConnection.createDataChannel('oai-events');

      // Create and set local description (offer)
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Check OpenAI API URL
      if (!process.env.NEXT_PUBLIC_OPENAI_API_URL) {
        throw new Error('OpenAI API URL is not set');
      }

      // Send offer to OpenAI
      const sdpResponse = await fetch(process.env.NEXT_PUBLIC_OPENAI_API_URL, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/sdp',
        },
      });

      // Handle SDP response
      if (!sdpResponse.ok) {
        if (
          userApiKey &&
          (sdpResponse.status === 401 || sdpResponse.status === 403)
        ) {
          toast.error('Invalid OpenAI API key. Please check and try again.');
        } else {
          toast.error('Failed to start session');
        }

        throw new Error(
          `Failed to send SDP (${sdpResponse.status}): ${await sdpResponse.text()}`
        );
      }

      // Process remote description (answer)
      const sdp = await sdpResponse.text();
      await peerConnection.setRemoteDescription({ type: 'answer', sdp });

      // Update state in SessionHandler
      setMediaStream(mediaStream);
      setDataStream(dataChannel);
      setPeerConnection(peerConnection);

      setSessionStatus('connected');
      return true;
    } catch (error) {
      console.error('Error establishing connection:', error);
      setSessionStatus('error');

      if (error instanceof Error) {
        toast.error(`Connection error: ${error.message}`);
      } else {
        toast.error('Failed to establish connection');
      }

      return false;
    }
  }, [
    audioEl,
    muted,
    setDataStream,
    setMediaStream,
    setPeerConnection,
    setSessionStatus,
    getUserProvidedApiKey,
    setupAudioVisualizer,
  ]);

  return {
    establishConnection,
  };
}
