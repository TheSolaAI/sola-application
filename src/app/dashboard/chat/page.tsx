'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { toast } from 'sonner';
import { RiSendPlaneFill, RiMicFill } from 'react-icons/ri';
import { BiLoaderAlt } from 'react-icons/bi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserHandler } from '@/store/UserHandler';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Child element animations
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// Mic button animation variants
const micButtonVariants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.05,
    boxShadow: '0px 5px 15px rgba(var(--color-primary), 0.15)',
  },
  recording: {
    scale: [1.1, 1.15, 1.1],
    borderColor: 'rgb(var(--color-primary))',
    boxShadow: '0px 0px 25px rgba(var(--color-primary), 0.3)',
    transition: {
      scale: {
        repeat: Infinity,
        duration: 2,
      },
    },
  },
  processing: {
    scale: 1,
    borderColor: 'rgb(var(--color-primary))',
    boxShadow: '0px 0px 15px rgba(var(--color-primary), 0.2)',
  },
};

// Suggestion card animations
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05 + 0.3,
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  }),
  hover: {
    y: -10,
    boxShadow: '0px 10px 20px rgba(var(--color-primaryDark), 0.15)',
    borderColor: 'rgba(var(--color-primary), 0.5)',
    backgroundColor: 'rgba(var(--color-primaryDark), 0.03)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
};

export default function NewChat() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const { createChatRoom } = useChatRoomHandler();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Audio recording logic with hold-and-release model
  const startRecording = async () => {
    if (isRecording || isProcessingAudio) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleAudioStop;

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0); // Reset timer when starting

      // Start recording timer
      if (timerId.current) {
        clearInterval(timerId.current);
      }

      timerId.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          const nextTime = prevTime + 1;
          if (nextTime >= 30) {
            stopRecording();
            return 30;
          }
          return nextTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);

      // Clear timer
      if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;
      }
    }
  };

  const handleAudioStop = async () => {
    if (audioChunksRef.current.length === 0) {
      return; // No audio recorded
    }

    setIsProcessingAudio(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

      // Create form data for upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      // Send to transcription API
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useUserHandler.getState().authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      if (data.success && data.text) {
        // Process the transcribed text
        handleInitialMessage(data.text);
      } else {
        toast.error('Could not transcribe audio');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  // Handle pointer events for hold and release
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!isProcessingAudio) {
      startRecording();

      // Capture pointer to ensure we get the up event
      if (buttonRef.current) {
        buttonRef.current.setPointerCapture(e.pointerId);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();

      // Release pointer capture
      if (buttonRef.current) {
        buttonRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };

  // Handle pointer leave/cancel
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (isRecording) {
      stopRecording();
    }
  };

  // Function to handle text or transcribed audio input
  const handleInitialMessage = async (messageText: string) => {
    if (!messageText.trim()) {
      return;
    }

    try {
      toast.loading('Creating your chat...');

      // Create a new chat room with a title based on the message
      const title =
        messageText.substring(0, 20) + (messageText.length > 20 ? '...' : '');
      const newRoom = await createChatRoom({ name: title });

      if (!newRoom || !newRoom.id) {
        toast.error('Failed to create chat room');
        return;
      }

      // Store the initial message in localStorage
      localStorage.setItem('pending_message', messageText);

      // Navigate to the new chat room
      toast.dismiss();
      router.push(`/dashboard/chat/${newRoom.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInitialMessage(inputText);
    setInputText('');
  };

  // Define suggestion cards
  const suggestions = [
    {
      title: 'Check my wallet',
      description: 'check the portfolio of your wallet',
    },
    {
      title: 'Launch a new token',
      description: 'deploy a new token on pump.fun',
    },
    {
      title: 'Swap 1 SOL for USDC',
      description: 'using Jupiter to swap on Solana',
    },
    {
      title: "What's trending on Solana?",
      description: 'find the current market trends',
    },
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-background text-textColor p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="w-full max-w-3xl mx-auto flex flex-col items-center px-2 sm:px-4">
        {/* Header */}
        <motion.h1
          className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center"
          variants={itemVariants}
        >
          How can I assist you?
        </motion.h1>

        {/* Voice Input Button with animations */}
        <motion.div
          className="relative mb-6 sm:mb-8 flex flex-col items-center"
          variants={itemVariants}
        >
          <motion.button
            ref={buttonRef}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-2 border-primary/50 bg-primaryDark/20"
            variants={micButtonVariants}
            initial="idle"
            whileHover={isProcessingAudio ? 'processing' : 'hover'}
            animate={
              isRecording
                ? 'recording'
                : isProcessingAudio
                  ? 'processing'
                  : 'idle'
            }
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerLeave}
            disabled={isProcessingAudio}
            aria-label={
              isRecording
                ? 'Release to stop recording'
                : isProcessingAudio
                  ? 'Processing audio'
                  : 'Hold to record'
            }
          >
            <AnimatePresence mode="wait">
              {isProcessingAudio ? (
                <motion.div
                  key="processing"
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={{ rotate: 360, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <BiLoaderAlt className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                </motion.div>
              ) : isRecording ? (
                <motion.div
                  key="recording"
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div className="flex gap-1 mt-2">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-6 sm:h-8 bg-primary rounded-full"
                        animate={{
                          height: [6, 14, 20, 14, 6],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          delay: i * 0.15,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <RiMicFill className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.span
            className="mt-2 text-xs sm:text-sm text-secText"
            animate={{
              opacity: [1, 0.7, 1],
              transition: { repeat: isRecording ? Infinity : 0, duration: 2 },
            }}
          >
            {isRecording
              ? `Recording...`
              : isProcessingAudio
                ? 'Processing...'
                : 'Hold to speak'}
          </motion.span>
        </motion.div>

        {/* Text Input with animations */}
        <motion.form
          onSubmit={handleSubmit}
          className="w-full mb-8 sm:mb-12 px-1 sm:px-0"
          variants={itemVariants}
        >
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <Input
              className="w-full bg-sec_background/60 border-border rounded-full py-4 sm:py-6 pl-4 sm:pl-6 pr-12 focus-within:border-primary/70 focus-within:shadow-lg focus-within:shadow-primary/10 transition-all duration-300 text-sm sm:text-base"
              placeholder="Start a new conversation..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={200}
              rightIcon={
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    className="rounded-full p-1.5 sm:p-2 h-auto"
                    disabled={!inputText.trim()}
                  >
                    <RiSendPlaneFill className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </motion.div>
              }
            />
            {inputText && (
              <motion.span
                className="absolute right-12 sm:right-14 top-1/2 transform -translate-y-1/2 text-xs text-secText"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {inputText.length}/200
              </motion.span>
            )}
          </motion.div>
        </motion.form>

        {/* Suggestions with staggered animation */}
        <motion.div className="w-full" variants={itemVariants}>
          <motion.h2
            className="text-xs sm:text-sm text-secText mb-2 sm:mb-3 px-1"
            variants={itemVariants}
          >
            Suggestions
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            variants={containerVariants}
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                onClick={() => handleInitialMessage(suggestion.title)}
                className="overflow-hidden rounded-lg"
              >
                <Card className="p-3 sm:p-4 cursor-pointer h-full border border-border relative z-10 transition-colors duration-300">
                  <motion.h3
                    className="font-medium mb-1 text-sm sm:text-base text-textColor"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {suggestion.title}
                  </motion.h3>

                  <motion.p
                    className="text-xs sm:text-sm text-secText line-clamp-2"
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {suggestion.description}
                  </motion.p>

                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
