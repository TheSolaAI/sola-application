import { useState, useRef, useCallback, useEffect } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { Connection } from '@solana/web3.js';
import { transferSolTx } from '../lib/solana/transferSol';
import { MessageCard } from '../types/messageCard';
import { SwapParams } from '../types/swap';
import { swapTx } from '../lib/solana/swapTx';
import { tools } from '../tools/tools';
import SessionControls from '../components/SessionControls';
import WalletUi from '../components/wallet/WalletUi';
import MessageList from '../components/ui/MessageList';
import { tokenList } from '../store/tokens/tokenMapping';
import { fetchMagicEdenLaunchpadCollections } from '../lib/solana/magiceden';
import { addCalenderEventFunction } from '../tools/functions/addCalenderEvent';
import { AssetsParams, DepositParams, WithdrawParams } from '../types/lulo';
import { depositLulo, getAssetsLulo, withdrawLulo } from '../lib/solana/lulo';

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

  const handleSwap = async (
    quantity: number,
    tokenA: 'SOL' | 'SEND' | 'USDC',
    tokenB: 'SOL' | 'SEND' | 'USDC',
  ) => {
    if (!rpc) return;
    if (!tokenList[tokenA] || !tokenList[tokenB]) return;

    console.log(quantity * 10 ** tokenList[tokenA].DECIMALS, tokenA, tokenB);

    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is performing the swap`,
      },
    ]);

    const params: SwapParams = {
      input_mint: tokenList[tokenA].MINT,
      output_mint: tokenList[tokenB].MINT,
      public_key: `${wallets[0].address}`,
      amount: quantity * 10 ** tokenList[tokenA].DECIMALS,
    };

    const connection = new Connection(rpc);
    const transaction = await swapTx(params);
    if (!transaction) return;

    const signedTransaction = await solanaWallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );
    console.log(signature);
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'message',
        message: 'Swap is success. ',
        link: `https://solscan.io/tx/${signature}`,
      },
    ]);

    // console.log(
    //   await connection.confirmTransaction({
    //     blockhash,
    //     lastValidBlockHeight,
    //     signature,
    //   }),
    // );

    return;
  };

  const handleUserAssetsLulo = async () => {
    if (!rpc) return;
  
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is fetching Lulo Assets`,
      },
    ]);

    const params: AssetsParams = {
      owner: `${wallets[0].address}`,
    };
    const assets = await getAssetsLulo(params);
    if (!assets) return;
    let assets_string = JSON.stringify(assets) 
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'message',
        message: `Successfully fetched Lulo Assets: ${assets_string}`,
      },
    ]);
    return;
  };

  const handleDepositLulo = async (
    amount: number,
    token: 'USDT' | 'USDS' | 'USDC',
  ) => {
    if (!rpc) return;
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is depositing the asset`,
      },
    ]);
    const params: DepositParams = {
      owner: `${wallets[0].address}`,
      depositAmount: amount,
      mintAddress: tokenList[token].MINT,
    };
    
    const connection = new Connection(rpc);
    
    const transaction_array = await depositLulo(params);
    if (!transaction_array) return;
    let count = 0
    for (const transaction in transaction_array) { 
      count += 1;
      const signedTransaction = await solanaWallet.signTransaction(
        transaction_array[transaction],
      );
      console.log(signedTransaction);
      // const signature = await connection.sendRawTransaction(
      //   signedTransaction.serialize(),
      // );
      // console.log(signature);
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: `Deposit ${count} is success. `,
          link: `https://solscan.io/tx/${signedTransaction}`,
        },
      ]);
    }
  }
  
  const handleWithdrawLulo = async (
    amount: number,
    all: boolean,
    token: 'USDT' | 'USDS' | 'USDC',
  ) => {
    if (!rpc) return;
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is withdrawing the asset`,
      },
    ]);
    const params: WithdrawParams = {
      public_key: `${wallets[0].address}`,
      amount: amount,
      mint: tokenList[token].MINT,
      withdraw_all: all,
    };
    
    const connection = new Connection(rpc);
    
    const transaction_array = await withdrawLulo(params);
    if (!transaction_array) return;
    let count = 0
    for (const transaction in transaction_array) { 
      count += 1;
      const signedTransaction = await solanaWallet.signTransaction(
        transaction_array[transaction],
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
      );
      console.log(signature);
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: `Deposit ${count} is success. `,
          link: `https://solscan.io/tx/${signature}`,
        },
      ]);
    }
}
  const handleLaunchpadCollections = async () => {
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Fetching upcoming NFT launches`,
      },
    ]);
    try {
      const data = await fetchMagicEdenLaunchpadCollections();

      const formattedData: MessageCard[] = data.map((collection) => ({
        type: 'nftcards',
        card: {
          title: collection.name,
          descirption: collection.description,
          image: collection.image,
          price: collection.price,
          size: collection.size,
          date: collection.launchDatetime,
        },
      }));

      setMessageList((prevMessageList) => [
        ...(prevMessageList || []),
        ...formattedData,
      ]);

      return data;
    } catch (error) {
      console.error('Error fetching and processing collections:', error);
      return;
    }
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

    const handleEvents = async () => {
      const firstEvent = events[events.length - 1];

      if (
        firstEvent.type === 'session.created' &&
        !events.some((e) => e.type === 'session.update')
      ) {
        sendClientEvent(tools);
      }

      const mostRecentEvent = events[0];

      if (
        mostRecentEvent.type === 'response.done' &&
        mostRecentEvent.response.output
      ) {
        for (const output of mostRecentEvent.response.output) {
          if (output.type === 'function_call') {
            console.log('function called');

            if (output.name === 'toggleWallet') {
              const { action } = JSON.parse(output.arguments);
              console.log(action);

              if (action === 'open' && !isWalletVisible) {
                console.log('open', isWalletVisible);
                toggleWallet();
              } else if (action === 'close' && isWalletVisible) {
                console.log('close', isWalletVisible);
                toggleWallet();
              }

              setTimeout(() => {
                sendClientEvent({
                  type: 'response.create',
                  response: {
                    instructions: 'Ask what the user wants to do next.',
                  },
                });
              }, 500);
            } else if (output.name === 'swapTokens') {
              const { quantity, tokenA, tokenB } = JSON.parse(output.arguments);
              await handleSwap(quantity, tokenA, tokenB);

              setTimeout(() => {
                sendClientEvent({
                  type: 'response.create',
                  response: {
                    instructions: 'Ask what the user wants to do next.',
                  },
                });
              }, 500);
            } else if (output.name === 'getLuloAssets') {
              
              await handleUserAssetsLulo();

              setTimeout(() => {
                sendClientEvent({
                  type: 'response.create',
                  response: {
                    instructions: 'Ask what the user wants to do next.',
                  },
                });
              }, 500);
            }
            else if (output.name === 'depositLulo') {
              const { amount,token} = JSON.parse(output.arguments);
              await handleDepositLulo(amount, token);

              setTimeout(() => {
                sendClientEvent({
                  type: 'response.create',
                  response: {
                    instructions: 'Ask what the user wants to do next.',
                  },
                });
              }, 500);
            }
            else if (output.name === 'withdrawLulo') {
              {
                const { amount, all, token } = JSON.parse(output.arguments);
                await handleWithdrawLulo(amount, all, token);

                setTimeout(() => {
                  sendClientEvent({
                    type: 'response.create',
                    response: {
                      instructions: 'Ask what the user wants to do next.',
                    },
                  });
                }, 500);
              }
            }
            else if (output.name === 'getNFTLaunchpad') {
              const data = await handleLaunchpadCollections();

              setTimeout(() => {
                sendClientEvent({
                  type: 'response.create',
                  response: {
                    result: data,
                  },
                });
              }, 500);
            } else if (output.name === 'addCalenderEvent') {
              // TODO: Implement calender event addition logic
              const { summary, description, dateTime, timeZone } = JSON.parse(
                output.arguments,
              );
              setMessageList((prev) => [
                ...(prev || []),
                {
                  type: 'agent',
                  message: `Agent is adding details to your calender`,
                },
              ]);
              await addCalenderEventFunction();

              setTimeout(() => {
                sendClientEvent({
                  type: 'response.create',
                  response: {
                    instructions: 'The event has been successfully added to calender.',
                  },
                });
              }, 500);
            }
          }
        }
      }
    };

    handleEvents();
  }, [events, sendClientEvent]);

  return (
    <>
      <main className="h-screen flex flex-col relative">
        {/* Start of wallet */}
        <section className="absolute right-0 p-4">
          <WalletUi
            toggleWallet={toggleWallet}
            isWalletVisible={isWalletVisible}
          />
        </section>
        {/* End of wallet */}

        {/* Start of Visualizer Section */}
        <section
          className={`flex items-center justify-center ${
            messageList ? 'h-1/4' : 'h-1/2'
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
          <section className="flex-grow flex justify-center items-start overflow-y-auto">
            <MessageList messageList={messageList} />
          </section>
        )}
        {/* End of Message display Section */}

        {/* Start of Session Controls Section */}
        <section className="fixed bottom-0 left-1/2  transform -translate-x-4 p-4 flex justify-center">
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

