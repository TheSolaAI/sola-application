import { useState, useRef, useCallback, useEffect } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import { Connection, PublicKey } from '@solana/web3.js';
import { transferSolTx } from '../lib/solana/transferSol';
import {
  MessageCard,
  LuloCard,
  TransactionCard,
  TokenCard,
  SanctumCard,
  NFTCollectionCard,
  TrendingNFTCard,
  RugCheckCard,
  MarketDataCard,
  MarketInfo,
} from '../types/messageCard';
import { SwapParams } from '../types/swap';
import { swapTx } from '../lib/solana/swapTx';
import { createToolsConfig } from '../tools/tools';
import SessionControls from '../components/SessionControls';
import WalletUi from '../components/wallet/WalletUi';
import MessageList from '../components/ui/MessageList';
import { tokenList } from '../store/tokens/tokenMapping';
import {
  fetchMagicEdenLaunchpadCollections,
  fetchMagicEdenNFTPrice,
  fetchTrendingNFTs,
} from '../lib/solana/magiceden';
import { AssetsParams, DepositParams, WithdrawParams } from '../types/lulo';
import { depositLulo, getAssetsLulo, withdrawLulo } from '../lib/solana/lulo';
import useAppState from '../store/zustand/AppState';
import useChatState from '../store/zustand/ChatState';
import { getTokenData, getTokenDataSymbol } from '../lib/solana/token_data';
import { getLstData } from '../lib/solana/lst_data';
import { responseToOpenai } from '../lib/utils/response';
import { useWalletStore } from '../store/zustand/WalletState';
import Loader from '../common/Loader/index';
import { getPublicKeyFromSolDomain } from '../lib/solana/sns';
import { swapLST } from '../lib/solana/swapLst';
import { fetchLSTAddress } from '../lib/utils/lst_reader';
import { transferSplTx } from '../lib/solana/transferSpl';
import { getRugCheck } from '../lib/solana/rugCheck';
import { getMarketData } from '../lib/utils/marketMacro';
import { useParams } from 'react-router-dom';
import { useChat } from '../hooks/useChatRoom';
import { useRoomStore } from '../store/zustand/RoomState';
import { toast } from 'sonner';
import useChatHandler from '../hooks/handleAddMessage';
import { agentMessage } from '../lib/chat-message/agentMessage';
import { customMessageCards } from '../lib/chat-message/customMessageCards';
import { messageCard, transactionCard } from '../lib/chat-message/messageCard';
// import { useFundWallet } from '@privy-io/react-auth/solana';

const Conversation = () => {
  const {
    isSessionActive,
    setIsSessionActive,
    dataChannel,
    setDataChannel,
    mediaRecorder,
    setMediaRecorder,
    setPeerConnection,
    getPeerConnection,
    resetMute,
  } = useChatState();
  const { assets } = useWalletStore();
  const { id } = useParams<{ id: string }>();
  const { getRoomMessages, loading, error, messageLoadingError } = useChat();
  const { setCurrentRoomId, messageList, setMessageList, currentRoomId } =
    useRoomStore();
  const { handleAddMessage } = useChatHandler();
  // const { fundWallet } = useFundWallet();

  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const [fetchedToken, setFetchedToken] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  const [localDataChannel, setLocalDataChannel] = useState(dataChannel);

  useEffect(() => {
    async function loadMessages() {
      if (id) {
        console.log(id);
        setMessageList(() => []);
        await getRoomMessages(id);
      } else {
        setCurrentRoomId(null);
      }
    }

    loadMessages();
  }, [id]);

  useEffect(() => {
    if (messageLoadingError) toast.error('Failed to load the chat data');
  }, [messageLoadingError]);

  useEffect(() => {
    setLocalDataChannel(dataChannel);
  }, [dataChannel]);

  const { appWallet, theme, aiEmotion, aiVoice } = useAppState();

  const rpc = process.env.SOLANA_RPC;

  const marketMacro = async () => {
    // await handleAddMessage(agentMessage('Agent analysing the market'));

    let marketData = await getMarketData();

    let market: string = marketData['market'];
    let voice = marketData['voice'];
    let stats = marketData['stats'];
    let btcDominance = stats['btcDominance'];
    let ethDominance = stats['ethDominance'];
    const marketInfo: string[] = market
      .trim()
      .split('\n')
      .map((line) => line.replace(/^-\s*/, ''));

    let marketAnalysis: MarketInfo[] = [];

    marketInfo.map((item) => {
      try {
        let text = item.split('[Source]')[0];
        let linkPart = item.split('[Source]')[1];

        if (linkPart) {
          let link = linkPart.slice(1, -1);
          marketAnalysis.push({
            text: text,
            link: link,
          });
        } else {
          console.warn('Missing link for item:', item);
        }
      } catch (e) {
        console.log(e);
      }
    });

    let marketDataCard: MarketDataCard = {
      marketAnalysis: marketAnalysis,
      coinInfo: [],
    };

    //todo create a ui for displaying the data
    await handleAddMessage(
      customMessageCards('marketDataCard', marketDataCard),
    );
    await handleAddMessage(
      messageCard(`Todays BTCDOM: ${btcDominance} and ETHDOM: ${ethDominance}`),
    );

    return responseToOpenai(
      `tell the user the contents of ${voice}, use current affairs on your own, to give report,  and ask them what they want to do`,
    );
  };

  const transferSol = async (amount: number, to: string) => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'Ask the user to contact admin as the rpc is not attached',
      );
    const LAMPORTS_PER_SOL = 10 ** 9;
    let recipient = to;
    if (to.endsWith('.sol')) {
      recipient = await getPublicKeyFromSolDomain(to);
    }

    await handleAddMessage(
      agentMessage(`Agent is transferring ${amount} SOL to ${to}`),
    );

    try {
      const connection = new Connection(rpc);
      let balance = await connection.getBalance(
        new PublicKey(appWallet.address),
      );
      if (balance / LAMPORTS_PER_SOL - 0.01 < amount) {
        await handleAddMessage(
          messageCard(
            'Insufficient balance. Please maintain 0.01 balance minimum',
          ),
        );
        return responseToOpenai(
          'tell the user that they dont have enough balance and ask them to fund their account',
        );
      }

      const transaction = await transferSolTx(
        appWallet.address,
        recipient,
        amount * LAMPORTS_PER_SOL,
      );
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      const signedTransaction = await appWallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
      );

      //TODO: add dynamic status and handle failed transactions
      await handleAddMessage(transactionCard(signature));

      return responseToOpenai(
        'Transaction is successful. ask what the user wants to do next',
      );
    } catch (error) {
      await handleAddMessage(
        messageCard('There occurred a problem with performing the transaction'),
      );

      console.error('error during sending transaction', error);
      return responseToOpenai(
        'just tell the user that there has been a problem with making transaction',
      );
    }
  };

  const getWalletAssets = async () => {
    const assetDetails = assets.map((item) => {
      const amount = (item.balance / 10 ** item.decimals).toFixed(2);
      return { symbol: item.symbol, amount: parseFloat(amount) };
    });

    const totalAmount = assets
      .reduce((acc, asset) => acc + asset.balance / 10 ** asset.decimals, 0)
      .toFixed(2);

    setMessageList((prev) => {
      return [
        ...prev,
        agentMessage(`The agent is fetching your wallet assets`),
      ];
    });

    setIsWalletVisible(true);

    return responseToOpenai(
      `user assets ${assetDetails}, total value ${totalAmount}. Note: if the user has enquired abt pauticular asset balance, try to tell details about the pauticular asset only`,
    );
  };

  const transferSpl = async (
    amount: number,
    token: 'SOLA' | 'USDC' | 'BONK' | 'USDT' | 'JUP',
    to: string,
  ) => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'Ask the user to contact admin as the rpc is not attached',
      );

    let recipient = to;
    if (to.endsWith('.sol')) {
      recipient = await getPublicKeyFromSolDomain(to);
    }
    await handleAddMessage(
      agentMessage(`Agent is transferring ${amount} ${token} to ${to}`),
    );

    let token_mint = tokenList[token].MINT;
    try {
      const connection = new Connection(rpc);

      const transaction = await transferSplTx(
        appWallet.address,
        recipient,
        amount,
        token_mint,
      );
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      if (!transaction) {
        await handleAddMessage(
          messageCard(
            'There occurred a problem with performing the transaction',
          ),
        );

        return responseToOpenai(
          'tell the user that there has been a problem with making transaction and try again later',
        );
      }

      transaction.recentBlockhash = blockhash;
      const signedTransaction = await appWallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
      );

      //TODO: add dynamic status and handle failed transactions
      await handleAddMessage(transactionCard(signature));

      return responseToOpenai(
        'Transaction is successful. ask what the user wants to do next',
      );
    } catch (error) {
      await handleAddMessage(
        messageCard(
          `There occurred a problem with performing the transaction ${error}`,
        ),
      );

      console.error('error during sending transaction', error);
      return responseToOpenai(
        'tell the user that there has been a problem with making transaction and try again later',
      );
    }
  };

  const handleSwap = async (
    quantity: number,
    tokenA: 'SOL' | 'SOLA' | 'USDC' | 'BONK' | 'USDT' | 'JUP' | 'WIF',
    tokenB: 'SOL' | 'SOLA' | 'USDC' | 'BONK' | 'USDT' | 'JUP' | 'WIF',
    swapType: 'EXACT_IN' | 'EXACT_OUT' | 'EXACT_DOLLAR',
  ) => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );

    if (!tokenList[tokenA] || !tokenList[tokenB]) {
      await handleAddMessage(
        messageCard(
          "We don't support one of the tokens. Request admin to support it.",
        ),
      );

      return responseToOpenai(
        'tell the user that , We dont support one of the token',
      );
    } else if (tokenA === tokenB) {
      await handleAddMessage(
        messageCard("You can't swap between the same tokens! LOL"),
      );

      return responseToOpenai(
        'tell the user that they are trying to swap same token and ask them to select different token',
      );
    }

    await handleAddMessage(
      agentMessage(
        `Agent is performing the swap between ${tokenA} and ${tokenB}`,
      ),
    );

    const params: SwapParams = {
      input_mint: tokenList[tokenA].MINT,
      output_mint: tokenList[tokenB].MINT,
      public_key: `${appWallet.address}`,
      amount: quantity,
      swap_mode: swapType,
    };

    const connection = new Connection(rpc);
    const transaction = await swapTx(params);
    if (!transaction) {
      await handleAddMessage(messageCard(`Error during Swap.`));

      return responseToOpenai(
        'just tell the user that Swap failed and ask them to try later after some time',
      );
    }
    const latestBlockHash = await connection.getLatestBlockhash();

    const signedTransaction = await appWallet.signTransaction(transaction);

    const rawTransaction = signedTransaction.serialize();

    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 10,
    });

    // TODO: implement dynamic status
    await handleAddMessage(transactionCard(txid));

    return responseToOpenai(
      'tell the user that swap transaction is sent to blockchain',
    );
  };

  const handleUserAssetsLulo = async () => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );

    // await handleAddMessage(agentMessage(`Fetching your Lulo Assets`));

    const params: AssetsParams = {
      owner: `${appWallet.address}`,
    };
    const assets = await getAssetsLulo(params);

    if (!assets) {
      await handleAddMessage(
        messageCard('Oops! Unable to fetch your Lulo assets'),
      );

      return responseToOpenai(
        'tell the user that they dont have any assets in lulo right now',
      );
    }

    let luloCardItem: LuloCard = assets;

    await handleAddMessage(customMessageCards('luloCard', luloCardItem));

    return responseToOpenai(
      'tell the user that their lulo assets are successfully fetched',
    );
  };

  //TODO: Structure the Message Types
  const handleDepositLulo = async (
    amount: number,
    token: 'USDT' | 'USDS' | 'USDC',
  ) => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );

    // await handleAddMessage(agentMessage(`Agent is depositing the asset`));

    const params: DepositParams = {
      owner: `${appWallet.address}`,
      depositAmount: amount,
      mintAddress: tokenList[token].MINT,
    };

    const connection = new Connection(rpc);

    const transaction_array = await depositLulo(params);
    if (!transaction_array) {
      await handleAddMessage(
        messageCard(`Deposit failed. Check your balance.`),
      );

      return responseToOpenai(
        `tell the user that they dont have ${amount} worth of this ${token}`,
      );
    }

    for (const transaction in transaction_array) {
      let tx = transaction_array[transaction];
      let { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      tx.message.recentBlockhash = blockhash;
      let txCard: TransactionCard = {
        title: `1}`,
        status: '1',
        link: `1`,
      };
      try {
        const signedTransaction = await appWallet.signTransaction(
          transaction_array[transaction],
        );
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
        );
        txCard = {
          title: `Deposit ${amount} ${token}`,
          status: 'Transaction Sent',
          link: `https://solscan.io/tx/${signature}`,
        };
      } catch (error: any) {
        error.getLogs();
      }

      // TODO: Handle dynamic status

      setMessageList((prev) => [
        ...prev,
        {
          type: 'transaction',
          card: txCard,
        },
      ]);
    }
    return responseToOpenai(
      'tell the user that transaction is sent to blockchain',
    );
  };

  //TODO: Handle Message display
  const handleWithdrawLulo = async (
    amount: number,
    token: 'USDT' | 'USDS' | 'USDC',
  ) => {
    if (!appWallet) return null;
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );
    // await handleAddMessage(agentMessage(`Agent is withdrawing the asset`));

    let all = false;

    const assetParams: AssetsParams = {
      owner: `${appWallet.address}`,
    };
    let withdrawAmount = amount;
    const connection = new Connection(rpc);

    let assets = await getAssetsLulo(assetParams);
    if (assets) {
      let asset_list = assets.tokenBalance;
      asset_list.map((asset) => {
        if (asset.mint === tokenList[token].MINT) {
          if (asset.balance > 0) {
            if (asset.balance - amount < 100) {
              all = true;
              withdrawAmount = asset.balance;
              handleAddMessage(
                agentMessage(
                  `Lulo total must be greater than 100. Withdrawing ${Math.ceil(withdrawAmount)} ${token}`,
                ),
              );
            }
          }
        }
      });
    }

    withdrawAmount = Math.ceil(withdrawAmount);

    const params: WithdrawParams = {
      owner: `${appWallet.address}`,
      withdrawAmount: withdrawAmount,
      mintAddress: tokenList[token].MINT,
      withdrawAll: all,
    };

    try {
      const transaction_array = await withdrawLulo(params);

      if (!transaction_array) {
        await handleAddMessage(
          messageCard(`Withdrawal failed. Check your balance.`),
        );

        return responseToOpenai(
          `tell the user that withdraw of ${withdrawAmount} of the token ${token} failed due to less balance.`,
        );
      }

      for (const transaction in transaction_array) {
        let tx = transaction_array[transaction];
        let { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        tx.message.recentBlockhash = blockhash;

        const signedTransaction = await appWallet.signTransaction(
          transaction_array[transaction],
        );

        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
        );

        // TODO: Handle dynamic status
        let txCard: TransactionCard = {
          title: `Withdraw ${withdrawAmount} ${token}`,
          status: 'Sent transaction',
          link: `https://solscan.io/tx/${signature}`,
        };

        setMessageList((prev) => [
          ...prev,
          {
            type: 'transaction',
            card: txCard,
          },
        ]);
      }
      return responseToOpenai(
        'The transaction is sent . ask what the user wants to do next',
      );
    } catch (error) {
      console.error('error while performing the swap, ', error);
      return responseToOpenai(
        'Just tell the user that Swap failed and ask them to try later after some time',
      );
    }
  };

  //TODO: Handle the Message response
  const handleLaunchpadCollections = async () => {
    const message: MessageCard = {
      type: 'agent',
      message: `Fetching upcoming NFT launches`,
    };

    await handleAddMessage(message);
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

      return responseToOpenai(
        'tell the user that successfully fetched upcoming NFT launches.',
      );
    } catch (error) {
      await handleAddMessage(
        messageCard(
          'Oops! There has been a problem while fetching the NFT launches',
        ),
      );

      return responseToOpenai(
        'tell the user that there has been a problem while getting nft launches and ask them to try later.',
      );
    }
  };

  const handleTokenData = async (tokenMint: string) => {
    if (fetchedToken == tokenMint) {
      return responseToOpenai(
        'I have already fetch the data. tell them to input the address of the token.Ask if the user needed anything else.',
      );
    } else {
      setFetchedToken(tokenMint);
    }

    // await handleAddMessage(agentMessage(`Fetching ${tokenMint} data`));

    try {
      if (tokenMint.startsWith('$')) {
        const data = await getTokenDataSymbol(tokenMint);
        if (!data) {
          await handleAddMessage(
            messageCard(
              'Oops! There has been a problem in fetching token data',
            ),
          );

          return responseToOpenai(
            'tell the user that there has been a problem with fetching token data and ask them to try later.',
          );
        }

        let token_card: TokenCard[] = [
          {
            address: data.metadata.description,
            image: data.image,
            metadata: data.metadata,
            price: data.price.toString(),
            marketCap: data.marketcap.toString(),
            volume: data.volume.toString(),
            priceChange: data.price_change_24.toString(),
          },
        ];

        await handleAddMessage(customMessageCards('tokenCards', token_card));

        return responseToOpenai(
          'tell the user that the token data is fetched successfully',
        );
      } else {
        const data = await getTokenData(tokenMint);
        if (!data) {
          await handleAddMessage(
            messageCard(
              'Oops! There has been a problem in fetching token data',
            ),
          );

          return responseToOpenai(
            'tell the user that there has been a problem with fetching token data and ask them to try later.',
          );
        }

        if (data.price_change_24 == null) {
          data.price_change_24 = 0;
        }

        let token_card: TokenCard[] = [
          {
            address: tokenMint,
            image: data.image,
            metadata: data.metadata,
            price: data.price.toString(),
            marketCap: data.marketcap.toString(),
            volume: data.volume.toString(),
            priceChange: data.price_change_24.toString() || 'NaN',
          },
        ];

        await handleAddMessage(customMessageCards('tokenCards', token_card));

        return responseToOpenai(
          'The token data has been fetched successfully.Do not repeat the address. Ask if the user needed anything else.',
        );
      }
    } catch (error) {
      await handleAddMessage(
        messageCard('Oops! Encountered a problem while fetching token data.'),
      );

      return responseToOpenai(
        'tell the user that there has been a problem with fetching token data and ask them to try later.',
      );
    }
  };

  const handleLSTData = async () => {
    // await handleAddMessage(agentMessage(`Fetching lST Data`));

    try {
      const data = await getLstData();
      if (!data) {
        await handleAddMessage(
          messageCard('Oops! There has been a problem while fetching lst data'),
        );

        return responseToOpenai(
          'tell the user that there has been a problem while fetching lst data and ask them to try later',
        );
      }

      let lst_card: SanctumCard[] = data;

      await handleAddMessage(customMessageCards('sanctumCard', lst_card));

      return responseToOpenai(
        'tell the user that lst data is successfully fetched',
      );
    } catch (error) {
      await handleAddMessage(
        messageCard('Oops! There has been a problem while fetching lst data'),
      );

      return responseToOpenai(
        'tell the user that there has been a problem while fetching lst data and ask them to try later',
      );
    }
  };

  const handleRugCheck = async (token: string) => {
    // await handleAddMessage(agentMessage(`Checking if ${token} is a rug.`));

    try {
      let final_token = '';
      if (token.startsWith('$')) {
        final_token = token;
      } else {
        final_token = `$${token}`;
      }

      const data = await getRugCheck(final_token);

      if (!data) {
        await handleAddMessage(
          messageCard(
            'Oops! There has been a problem while identifying the data',
          ),
        );

        return responseToOpenai(
          'tell the user that there has been a problem identifying the data, do not repeat the address, only repeat if its a ticker',
        );
      }

      let rug_check_card: RugCheckCard = data;

      await handleAddMessage(
        customMessageCards('rugCheckCard', rug_check_card),
      );

      return responseToOpenai(
        `tell the user that the token has a risk score of ${rug_check_card.score}. if its above 0 and less than 200, its risky, and if its above 200 then high chances that it could be a rug`,
      );
    } catch (error) {
      await handleAddMessage(
        messageCard(
          'Oops! There has been a problem while identifying the data',
        ),
      );

      return responseToOpenai(
        'tell the user that there has been a problem while the token data. Do not repeat the token address, only repeat if its a ticker',
      );
    }
  };

  const handleNFTPrice = async (nft: string) => {
    // await handleAddMessage(agentMessage(`Fetching NFT Data`));

    try {
      let nft_symbol = nft.replace(/\s+/g, '_');
      const data = await fetchMagicEdenNFTPrice(nft, nft_symbol);
      if (!data) {
        await handleAddMessage(
          messageCard('Oops! There has been a problem while fetching NFT data'),
        );

        return responseToOpenai(
          'Tell the user that there has been a problem while fetching nft data and ask them to try later',
        );
      }

      let nft_card: NFTCollectionCard = data;

      await handleAddMessage(customMessageCards('nftCollectionCard', nft_card));

      return responseToOpenai(
        'tell the user that NFT data is successfully fetched',
      );
    } catch (error) {
      await handleAddMessage(
        messageCard('Oops! There has been a problem while fetching NFT data'),
      );

      return responseToOpenai(
        'Tell the user that there has been a problem while fetching nft data and ask them to try later',
      );
    }
  };

  const handleTrendingNFTs = async () => {
    // await handleAddMessage(agentMessage(`Fetching Trending NFTs`));

    try {
      const data = await fetchTrendingNFTs();
      if (!data) {
        await handleAddMessage(
          messageCard(
            'Oops! There has been a problem while fetching Trending NFT data',
          ),
        );

        return responseToOpenai(
          'Tell the user that there has been a problem while fetching nft data and ask them to try later',
        );
      }

      let nft_card: TrendingNFTCard[] = data;

      await handleAddMessage(customMessageCards('trendingNFTCard', nft_card));

      return responseToOpenai('tell the user NFT data is fetched');
    } catch (error) {
      await handleAddMessage(
        messageCard('Oops! There has been a problem while fetching NFT data'),
      );

      return responseToOpenai(
        'Tell the user that there has been a problem while fetching trending nfts and ask them to try later',
      );
    }
  };

  //TODO: Handle UI message Responses
  const handleLstSwaps = async (lst_amount: number, lst_symbol: string) => {
    let rpc = process.env.SOLANA_RPC_URL;
    if (!appWallet) return null;
    if (!rpc) {
      console.log('rpc not set');
      return responseToOpenai(
        'there has been a server error, prompt the user to try again later',
      );
    }
    await handleAddMessage(
      agentMessage(`Swapping ${lst_amount} ${lst_symbol} from Solana`),
    );

    try {
      //todo
      //create a fn to read sanctum list and fetch address
      let address = await fetchLSTAddress(lst_symbol);
      if (address == '') {
        await handleAddMessage(
          messageCard(`Problem while fetching LST address: ${lst_symbol}`),
        );

        return responseToOpenai(
          'error fetching in fetching lst address, prompt the user to try again',
        );
      }

      let swapAmount = lst_amount;

      let params: SwapParams = {
        input_mint: tokenList.SOL.MINT,
        output_mint: address,
        public_key: appWallet.address,
        amount: swapAmount,
        swap_mode: 'EXACT_IN',
      };

      const transaction = await swapLST(params);
      if (!transaction) {
        await handleAddMessage(
          messageCard(
            `Error while creating the swap transaction: ${lst_symbol}`,
          ),
        );

        return responseToOpenai(
          'error while creating the transaction, prompt the user to try again',
        );
      }
      let connection = new Connection(rpc);
      const signedTransaction = await appWallet.signTransaction(transaction);
      const serialzedTransaction = signedTransaction.serialize();
      const transactionSignature =
        await connection.sendRawTransaction(serialzedTransaction);

      setMessageList((prev) => [
        ...prev,
        {
          type: 'message',
          message: `Transaction sent`,
          link: `https://solscan.io/tx/${transactionSignature}`,
        },
      ]);
    } catch (error) {
      console.error(error);
      await handleAddMessage(
        messageCard(`Problem while swapping to LST: ${error}`),
      );
    }
  };

  const handleBubblemap = async (token: string) => {
    // await handleAddMessage(agentMessage(`Getting Bubblemap for ${token}`));

    try {
      if (token.startsWith('$')) {
        const tokenDetails = await getTokenDataSymbol(token);
        token = tokenDetails?.metadata.description || 'NaN';
      }
    } catch (error) {
      return responseToOpenai(
        'tell the user that there occured some problem while getting token details and ask them to try later',
      );
    }

    await handleAddMessage(
      customMessageCards('bubblemapCard', { token: token }),
    );

    return responseToOpenai(
      'tell the user that bubblemap is successfully fetched',
    );
  };

  const startSession = async () => {
    let url = process.env.DATA_SERVICE_URL;
    try {
      const tokenResponse = await fetch(`${url}data/session/create`);

      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

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
      const model = 'gpt-4o-mini-realtime-preview-2024-12-17';

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
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
      setPeerConnection(pc);
      setIsSessionActive(true);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  function stopSession() {
    const pc = getPeerConnection();

    if (dataChannel) {
      dataChannel.close();
    }
    if (pc) {
      pc.close();
      setPeerConnection(null);
    }

    setIsSessionActive(false);
    setDataChannel(null);
    resetMute();
  }

  const sendClientEvent = useCallback(
    (message: any) => {
      if (localDataChannel && localDataChannel.readyState === 'open') {
        message.event_id = message.event_id || crypto.randomUUID();
        localDataChannel.send(JSON.stringify(message));
        setEvents((prev) => [message, ...prev]);
      } else {
        console.error(
          'Failed to send message - no data channel available',
          message,
        );
      }
    },
    [localDataChannel, setEvents], // Only depend on localDataChannel and setEvents
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

  // WebRTC datachannel handling for message, open, close, error events.
  useEffect(() => {
    if (dataChannel) {
      dataChannel.addEventListener('message', (e) => {
        setEvents((prev) => [JSON.parse(e.data), ...prev]);
      });

      dataChannel.addEventListener('open', () => {
        setIsSessionActive(true);
        setEvents([]);
      });

      dataChannel.addEventListener('close', () => {
        setIsSessionActive(false);
      });

      dataChannel.addEventListener('error', (error) => {
        console.error('Data channel error:', error);
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
        sendClientEvent(createToolsConfig(aiVoice, aiEmotion));
      }

      const mostRecentEvent = events[0];

      if (
        mostRecentEvent.type === 'response.done' &&
        mostRecentEvent.response.output
      ) {
        for (const output of mostRecentEvent.response.output) {
          if (output.type === 'function_call') {
            const functionName = output.name;
            if (functionName === 'wallet_management') {
              const { action } = JSON.parse(output.arguments);
              let response = null;
              switch (action) {
                case 'check_balance': {
                  try {
                    response = await getWalletAssets();
                    sendClientEvent(response);
                  } catch (error) {
                    throw new Error('Failed to retrieve wallet assets');
                  }
                  break;
                }
                case 'fund_wallet': {
                  if (!appWallet)
                    throw new Error("You don't have a wallet selected");
                  // await fundWallet(appWallet.address, {
                  //   card: {
                  //     preferredProvider: 'moonpay',
                  //   },
                  //   amount: '',
                  // });
                  break;
                }
              }
            } else if (output.name === 'transferSolTx') {
              const { quantity, address } = JSON.parse(output.arguments);
              let response = await transferSol(quantity, address);
              sendClientEvent(response);
            } else if (output.name === 'swapTokens') {
              const { swapType, quantity, tokenA, tokenB } = JSON.parse(
                output.arguments,
              );
              let response = await handleSwap(
                quantity,
                tokenA,
                tokenB,
                swapType,
              );
              sendClientEvent(response);
            } else if (output.name === 'getTokenData') {
              const { token_address } = JSON.parse(output.arguments);
              let response = await handleTokenData(token_address);
              sendClientEvent(response);
            } else if (output.name === 'getLstData') {
              let response = await handleLSTData();
              sendClientEvent(response);
            } else if (output.name === 'getLuloAssets') {
              let response = await handleUserAssetsLulo();
              sendClientEvent(response);
            } else if (output.name === 'depositLulo') {
              const { amount, token } = JSON.parse(output.arguments);
              let response = await handleDepositLulo(amount, token);
              sendClientEvent(response);
            } else if (output.name === 'withdrawLulo') {
              const { amount, token } = JSON.parse(output.arguments);
              let response = await handleWithdrawLulo(amount, token);
              sendClientEvent(response);
            } else if (output.name === 'getNFTLaunchpad') {
              const response = await handleLaunchpadCollections();
              sendClientEvent(response);
            } else if (output.name === 'getNFTPrice') {
              const { nft_name } = JSON.parse(output.arguments);
              let response = await handleNFTPrice(nft_name);
              sendClientEvent(response);
            } else if (output.name === 'getTrendingNFTs') {
              let response = await handleTrendingNFTs();
              sendClientEvent(response);
            } else if (output.name === 'swapLST') {
              const { quantity, lst } = JSON.parse(output.arguments);
              let response = await handleLstSwaps(quantity, lst);
              sendClientEvent(response);
            } else if (output.name === 'transferSpl') {
              const { amount, token, address } = JSON.parse(output.arguments);
              let response = await transferSpl(amount, token, address);
              sendClientEvent(response);
            } else if (output.name === 'transferSpl') {
              const { amount, token, address } = JSON.parse(output.arguments);
              let response = await transferSpl(amount, token, address);
              sendClientEvent(response);
            } else if (output.name === 'getRugCheck') {
              const { token } = JSON.parse(output.arguments);
              let response = await handleRugCheck(token);
              sendClientEvent(response);
            } else if (output.name === 'getMarketData') {
              let response = await marketMacro();
              sendClientEvent(response);
            } else if (output.name === 'getBubblemap') {
              const { token } = JSON.parse(output.arguments);
              let response = await handleBubblemap(token);
              sendClientEvent(response);
            } else if (output.name === 'getBlinks') {
              const { actionName } = JSON.parse(output.arguments);
              setMessageList((prev) => [
                ...prev,
                {
                  type: 'blinkCard',
                  link: actionName,
                },
              ]);
              sendClientEvent(
                responseToOpenai(
                  'tell the user that you have opened the asked blink.',
                ),
              );
            }
          }
        }
      }
    };

    handleEvents();
  }, [events, sendClientEvent]);

  return isLoaded ? (
    messageLoadingError ? (
      <div className="text-center h-screen dark:bg-darkalign">
        Oops! The requested chat doesn't exists.
      </div>
    ) : (
      <>
        <main className="h-screen flex flex-col relative dark:bg-darkalign">
          {/* Start of wallet */}
          <section className="absolute right-0 p-4 animate-in fade-in-0 duration-300">
            <WalletUi
              toggleWallet={toggleWallet}
              isWalletVisible={isWalletVisible}
            />
          </section>
          {/* End of wallet */}

          {/* Start of Visualizer Section */}
          <section
            className={`flex items-center justify-center animate-in fade-in-0 duration-300 ${
              messageList ? 'h-1/4' : 'h-1/2'
            }`}
          >
            {mediaRecorder && (
              <LiveAudioVisualizer
                barColor={theme == 'light' ? '#1D1D1F' : '#D8B4FE'}
                mediaRecorder={mediaRecorder}
                width={400}
                height={200}
              />
            )}
          </section>
          {/* End of Visualizer Section */}

          {/* Start of Message display Section */}
          <section className="flex-grow flex justify-center items-start overflow-y-auto pb-20 no-scrollbar">
            {messageList && currentRoomId && (
              <MessageList messageList={messageList} />
            )}
          </section>
          {/* End of Message display Section */}

          {/* Start of Session Controls Section */}

          {/* End of Session Controls Section */}
        </main>
        <section className="relative flex justify-center items-end w-full  bg-black dark:bg-darkalign animate-in fade-in-0 duration-300">
          <div className="absolute  w-full bottom-0 left-1/2 transform -translate-x-1/2 p-4 flex justify-center bg-white dark:bg-darkalign">
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              sendTextMessage={sendTextMessage}
              isSessionActive={isSessionActive}
            />
          </div>
        </section>
      </>
    )
  ) : (
    <Loader />
  );
};

export default Conversation;
