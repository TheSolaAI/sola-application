import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderHook {
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  audioBlob: Blob | null;
}

const MAX_RECORDING_TIME = 30; // 30 seconds

export function useAudioRecorder(): AudioRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearMediaRefs = useCallback(() => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear media recorder
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setAudioBlob(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer to track recording time and auto-stop at 30 seconds
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;

          // Auto-stop at MAX_RECORDING_TIME seconds
          if (newTime >= MAX_RECORDING_TIME && isRecording) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }

          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      clearMediaRefs();
    }
  }, [isRecording]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state === 'inactive'
      ) {
        setIsRecording(false);
        clearTimer();
        clearMediaRefs();
        resolve(null);
        return;
      }

      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        setAudioBlob(audioBlob);
        setIsRecording(false);
        clearTimer();
        clearMediaRefs();
        resolve(audioBlob);
      });

      mediaRecorderRef.current.stop();
    });
  }, [clearTimer, clearMediaRefs]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setAudioBlob(null);
    clearTimer();
    clearMediaRefs();
  }, [clearTimer, clearMediaRefs]);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    audioBlob,
  };
}
