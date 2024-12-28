import { useState, useRef, useCallback, useEffect } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { Connection } from '@solana/web3.js';
import SessionControls from '../components/SessionControls';
import WalletUi from '../components/wallet/WalletUi';
import { transferSolTx } from '../lib/solana/transferSol';
import { MessageCard } from '../types/messageCard';
import MessageList from '../components/ui/MessageList';

const functionDescription = `Call this function when a user asks for a test`;

const sessionUpdate = {
  type: 'session.update',
  session: {
    tools: [
      {
        type: 'function',
        name: 'test',
        description: functionDescription,
        parameters: {
          type: 'object',
          strict: true,
          properties: {},

          required: [],
        },
      },
    ],

    tool_choice: 'auto',
  },
};

const Conversation = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [messageList, setMessageList] = useState<MessageCard[]>();

  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets[0];

  const rpc = process.env.SOLANA_RPC;

  const transferSol = async () => {
    if (!rpc) return;

    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is performing the transaction`,
      },
    ]);

    const connection = new Connection(rpc);
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    //TODO : Get the built Tx from microservice
    const transaction = await transferSolTx(wallets[0].address, connection);
    const signedTransaction = await solanaWallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log(signature);
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'message',
        message: 'Your transfer is success. ',
        link: `https://solscan.io/tx/${signature}`,
      },
    ]);

    console.log(
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      }),
    );
  };

  const startSession = async () => {
    try {
      // Create a peer connection
      const pc = new RTCPeerConnection();

      // Set up to play remote audio from the model
      audioElement.current = document.createElement('audio');
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        const stream = e.streams[0];
        if (audioElement.current) {
          audioElement.current.srcObject = stream;
        }

        if (MediaRecorder.isTypeSupported('audio/webm')) {
          const recorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm',
          });
          setMediaRecorder(recorder);
          recorder.start();
        } else {
          console.error('MediaRecorder does not support audio/webm format.');
        }
      };

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      setDataChannel(dc);

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error('Failed to fetch SDP response');
      }

      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      };

      await pc.setRemoteDescription(answer);
      peerConnection.current = pc;
      setIsSessionActive(true);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  const sendClientEvent = useCallback(
    (message: any) => {
      if (dataChannel) {
        message.event_id = message.event_id || crypto.randomUUID();
        dataChannel.send(JSON.stringify(message));
        setEvents((prev) => [message, ...prev]);
      } else {
        console.error(
          'Failed to send message - no data channel available',
          message,
        );
      }
    },

    [dataChannel],
  );

  function sendTextMessage(message: any) {
    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: 'response.create' });
  }

  function toggleWallet() {
    setIsWalletVisible(!isWalletVisible);
  }

  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener('message', (e) => {
        setEvents((prev) => [JSON.parse(e.data), ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener('open', () => {
        setIsSessionActive(true);
        setEvents([]);
      });
    }
  }, [dataChannel]);

  useEffect(() => {
    if (!events || events.length === 0) return;
    const firstEvent = events[events.length - 1];

    if (
      firstEvent.type === 'session.created' &&
      !events.some((e) => e.type === 'session.update')
    ) {
      sendClientEvent(sessionUpdate);
    }

    const mostRecentEvent = events[0];

    if (
      mostRecentEvent.type === 'response.done' &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output: any) => {
        if (
          output.type === 'function_call' &&
          output.name === 'display_color_palette' &&
          !events.some((e) => e.type === 'response.create')
        ) {
          console.log('function called');
          console.log('pallet');

          setTimeout(() => {
            sendClientEvent({
              type: 'response.create',

              response: {
                instructions: `ask for feedback about the color palette - don't repeat
                the colors, just ask if they like the colors.`,
              },
            });
          }, 500);
        }
      });
    }
  }, [events, sendClientEvent]);

  return (
    <>
      <main className="absolute h-screen top-0 left-0 right-0 bottom-0 flex flex-col">
        {/* Start of wallet */}
        <section className="absolute right-0 p-4">
          <WalletUi
            toggleWallet={toggleWallet}
            isWalletVisible={isWalletVisible}
          />
        </section>
        {/* End of wallet */}

        <div>
          <button onClick={transferSol}>test</button>
        </div>

        {/* Start of Visualizer Section */}
        <section
          className={`flex items-center justify-center ${
            messageList ? 'h-1/2' : 'h-full'
          }`}
        >
          {mediaRecorder && (
            <LiveAudioVisualizer
              barColor="#1D1D1F"
              mediaRecorder={mediaRecorder}
              width={400}
              height={200}
            />
          )}
        </section>
        {/* End of Visualizer Section */}

        {/* Start of Message display Section */}
        {messageList && (
          <section className="flex justify-center items-center">
            <MessageList messageList={messageList} />
          </section>
        )}
        {/* End of Message display Section */}

        {/* Start of Session Controls Section */}
        <section className="absolute bottom-0 left-1/2 transform -translate-x-1/2 p-4">
          <SessionControls
            startSession={startSession}
            stopSession={stopSession}
            sendTextMessage={sendTextMessage}
            isSessionActive={isSessionActive}
          />
        </section>
        {/* End of Session Controls Section */}
      </main>
    </>
  );
};

export default Conversation;
