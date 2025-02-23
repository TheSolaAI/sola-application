import { useState, useEffect, useRef } from 'react';

interface CustomVADProps {
  startOnLoad?: boolean;
  minSpeechFrames?: number;
  onSpeechEnd: (audioBuffer: Float32Array) => void;
}

interface CustomVADReturn {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
}

const useCustomVAD = ({
  startOnLoad = false,
  onSpeechEnd,
}: CustomVADProps): CustomVADReturn => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  const initAudio = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Ensure the worklet module loads before proceeding
      await audioContext.audioWorklet.addModule('/vad-processor.js');

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'vad-processor');
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'silence-detected') {
          stopRecording();
        }
      };

      // Initialize media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const float32Array = audioBuffer.getChannelData(0);
        onSpeechEnd(float32Array);
        audioChunksRef.current = [];
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      if (startOnLoad) {
        startRecording();
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  const startRecording = (): void => {
    if (!isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = (): void => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    initAudio();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};

export default useCustomVAD;
