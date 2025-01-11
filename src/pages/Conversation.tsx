import { useState, useRef, useCallback, useEffect } from 'react';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { transferSolTx } from '../lib/solana/transferSol';
import {
  MessageCard,
  LuloCard,
  TransactionCard,
  TokenCard,
  SanctumCard,
  NFTCollectionCard,
  TrendingNFTCard,
} from '../types/messageCard';
import { SwapParams } from '../types/swap';
import { swapTx } from '../lib/solana/swapTx';
import { tools } from '../tools/tools';
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
import { Loader } from 'react-feather';
import { getPublicKeyFromSolDomain } from '../lib/solana/sns'
import { swapLST } from '../lib/solana/swapLst';
import { fetchLSTAddress } from '../lib/utils/lst_reader';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { transferSplTx } from '../lib/solana/transferSpl';
import { assert } from 'console';

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
  const { assets,getAssetById } = useWalletStore();

  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const [messageList, setMessageList] = useState<MessageCard[]>();
  const [fetchedToken, setFetchedToken] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(true);

  const { appWallet } = useAppState();
  if (!appWallet) return null;

  const rpc = process.env.SOLANA_RPC;
  interface AssetList {
    [key: string]: any;
  }
  

  const transferSol = async (amount: number, to: string) => {
    if (!rpc)
      return responseToOpenai(
        'Ask the user to contact admin as the rpc is not attached',
      );
    const LAMPORTS_PER_SOL = 10 ** 9;
    let recipient = to;
    if (to.endsWith('.sol')) {
      recipient = await getPublicKeyFromSolDomain(to)
    }
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is transferring ${amount} SOL to ${to}`,
      },
    ]);

    try {
      const connection = new Connection(rpc);
      let balance = await connection.getBalance(
        new PublicKey(appWallet.address),
      );
      if (balance / LAMPORTS_PER_SOL - 0.01 < amount) {
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message:
              'Insufficient balance. Please maintain 0.01 balance minimum',
          },
        ]);
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
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'transaction',
          card: {
            title: 'Transaction',
            status: 'Pending',
            link: `https://solscan.io/tx/${signature}`,
          },
        },
      ]);

      return responseToOpenai(
        'Transaction is successful. ask what the user wants to do next',
      );
    } catch (error) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: 'There occured a problem with performing transaction',
        },
      ]);
      console.error('error during sending transaction', error);
      return responseToOpenai(
        'just tell the user that there has been a problem with making transaction',
      );
    }

    // console.log(
    //   await connection.confirmTransaction({
    //     blockhash,
    //     lastValidBlockHeight,
    //     signature,
    //   }),
    // );
  };
  const fetchWallet = async () => {
    let asset_details = "";
    const user_assets = assets
    user_assets.forEach(item => {
      const balance = item.balance
      const decimal = item.decimals;
      const name = item.symbol
      const amount = balance / 10 ** decimal;
      asset_details += `${name}\:${amount.toFixed(2)} `;

      }
    );
    
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `The agent is fetching you wallet assets`,
      },
    ]);
    console.log(asset_details);
    return responseToOpenai(`here is your asset list ${asset_details}. Do not stop till u say all the assets`);

  }
  const transferSpl = async (amount: number,token:'SOLA' | 'USDC' |'BONK'|"USDT"|"JUP", to: string) => {
    if (!rpc)
      return responseToOpenai(
        'Ask the user to contact admin as the rpc is not attached',
      );
    
    let recipient = to;
    if (to.endsWith('.sol')) {
      recipient = await getPublicKeyFromSolDomain(to)
    }
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is transferring ${amount} ${token} to ${to}`,
      },
    ]);
    let token_mint = tokenList[token].MINT
    try {
      const connection = new Connection(rpc);
      
      
      // if (balance < amount) {
      //   setMessageList((prev) => [
      //     ...(prev || []),
      //     {
      //       type: 'message',
      //       message:
      //         'Insufficient balance',
      //     },
      //   ]);
      //   return responseToOpenai(
      //     'tell the user that they dont have enough balance and ask them to fund their account',
      //   );
      // }

      const transaction = await transferSplTx(
        appWallet.address,
        recipient,
        amount,
        token_mint,
      );
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      if (!transaction) {
        console.log(transaction)
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message: 'There occured a problem with performing transaction',
          },
        ])
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
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'transaction',
          card: {
            title: 'Transaction',
            status: 'Pending',
            link: `https://solscan.io/tx/${signature}`,
          },
        },
      ]);

      return responseToOpenai(
        'Transaction is successful. ask what the user wants to do next',
      );
    } catch (error) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: `There occured a problem with performing transaction ${error}`,
        },
      ]);
      console.error('error during sending transaction', error);
      return responseToOpenai(
        'tell the user that there has been a problem with making transaction and try again later',
      );
    }

    // console.log(
    //   await connection.confirmTransaction({
    //     blockhash,
    //     lastValidBlockHeight,
    //     signature,
    //   }),
    // );
  };

  const handleSwap = async (
    quantity: number,
    tokenA: 'SOL' | 'SOLA' | 'USDC' |'BONK'|"USDT"|"JUP",
    tokenB: 'SOL' | 'SOLA' | 'USDC' |'BONK'|"USDT"|"JUP",
  ) => {
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );

    if (!tokenList[tokenA] || !tokenList[tokenB]) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message:
            'We dont support on of the tokens . Request admin to support it',
        },
      ]);
      return responseToOpenai(
        'tell the user that , We dont support one of the token',
      );
    } else if (tokenA === tokenB) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: 'You cant swap between same tokens! LOL',
        },
      ]);
      return responseToOpenai(
        'tell the user that they are trying to swap same token and ask them to select different token',
      );
    }

    const amount = quantity * 10 ** tokenList[tokenA].DECIMALS;
    const tokenAAsset = getAssetById(tokenList[tokenA].MINT);
    if (!tokenAAsset || tokenAAsset.balance < amount) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message:
            'Either we dont support the token or you have insufficient balance',
        },
      ]);
      return responseToOpenai(
        'tell the user that they dont have enough balance perform the swap and ask them to fund the account',
      );
    }

    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is performing the swap between ${tokenA} and ${tokenB}`,
      },
    ]);

    const params: SwapParams = {
      input_mint: tokenList[tokenA].MINT,
      output_mint: tokenList[tokenB].MINT,
      public_key: `${appWallet.address}`,
      amount: quantity * 10 ** tokenList[tokenA].DECIMALS,
    };

    const connection = new Connection(rpc);
    const transaction = await swapTx(params);
    if (!transaction) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: `Error during Swap.`,
        },
      ]);
      return responseToOpenai(
        'just tell the user that Swap failed and ask them to try later after some time',
      );
    }
    const signedTransaction = await appWallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );

    // TODO: implement dynamic status
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'message',
        message: 'Swap transaction sent ',
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

    return responseToOpenai(
      'tell the user that swap transaction is sent to blockchain',
    );
  };

  const handleUserAssetsLulo = async () => {
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );

    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Fetching your Lulo Assets`,
      },
    ]);

    const params: AssetsParams = {
      owner: `${appWallet.address}`,
    };
    const assets = await getAssetsLulo(params);

    if (!assets) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: 'Oops! Unable to fetch your lulo assets',
        },
      ]);
      return responseToOpenai(
        'tell the user that they dont have any assets in lulo right now',
      );
    }

    let luloCardItem: LuloCard = assets;

    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'luloCard',
        card: luloCardItem,
      },
    ]);
    return responseToOpenai(
      'tell the user that their lulo assets are successfully fetched',
    );
  };

  const handleDepositLulo = async (
    amount: number,
    token: 'USDT' | 'USDS' | 'USDC',
  ) => {
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is depositing the asset`,
      },
    ]);
    const params: DepositParams = {
      owner: `${appWallet.address}`,
      depositAmount: amount,
      mintAddress: tokenList[token].MINT,
    };

    const connection = new Connection(rpc);

    const transaction_array = await depositLulo(params);
    if (!transaction_array) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: `Deposit failed. Check your balance.`,
        },
      ]);
      return responseToOpenai(
        `tell the user that they dont have ${amount} worth of this ${token}`,
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
        title: `Deposit ${amount} ${token}`,
        status: 'Transaction Sent',
        link: `https://solscan.io/tx/${signature}`,
      };

      setMessageList((prev) => [
        ...(prev || []),
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

  const handleWithdrawLulo = async (
    amount: number,
    token: 'USDT' | 'USDS' | 'USDC',
  ) => {
    if (!rpc)
      return responseToOpenai(
        'ask the user to contact admin as the rpc is not attached',
      );
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Agent is withdrawing the asset`,
      },
    ]);
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
              setMessageList((prev) => [
                ...(prev || []),
                {
                  type: 'agent',
                  message: `Lulo total must be greater than 100. Withdrawing ${Math.ceil(withdrawAmount)} ${token}`,
                },
              ]);
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
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message: `Withdrawal failed. Check your balance.`,
          },
        ]);
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
          ...(prev || []),
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
      console.error('error while performing the swap, ', error)
      return responseToOpenai(
        'Just tell the user that Swap failed and ask them to try later after some time',
      );
    }
  };

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

      return responseToOpenai(
        'tell the user that successfully fetched upcoming NFT launches.',
      );
    } catch (error) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message:
            'Oops! There has been a problem while fetching the nft launches',
        },
      ]);
      return responseToOpenai(
        'tell the user that there has been a problem while getting nft launches and ask them to try later.',
      );
    }
  };

  const handleTokenData = async (tokenMint: string) => {
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Fetching token data`,
      },
    ]);
    try {
      const data = await getTokenData(tokenMint);
      if (!data) {
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message: 'Oops! there has been a problem in fetching token data',
          },
        ]);
        return responseToOpenai(
          'tell the user that there has been a problem with fetching token data and ask them to try later.',
        );
      }

      let token_card: TokenCard[] = [
        {
          address: tokenMint,
          image: data.image,
          metadata: data.metadata,
          price: data.price.toString(),
          marketCap: data.marketcap.toString(),
        },
      ];

      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'tokenCards',
          card: token_card,
        },
      ]);
      return responseToOpenai('Ask if the user needed anything else.');
    } catch (error) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: 'Oops! Encountered a problem while fetching token data.',
        },
      ]);
      return responseToOpenai(
        'tell the user that there has been a problem with fetching token data and ask them to try later.',
      );
    }
  };

  const handleTokenDataSymbol = async (tokenSymbol: string) => {
    if (fetchedToken == tokenSymbol) {
      return responseToOpenai('I have already fetch the data. tell them to input the address of the token.Ask if the user needed anything else.');
    }
    else { 
      setFetchedToken(tokenSymbol);
    }
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Fetching ${tokenSymbol} data`,
      },
    ]);
    try {
      const data = await getTokenDataSymbol(tokenSymbol);
      if (!data) {
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message: 'Oops! there has been a problem in fetching token data',
          },
        ]);
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
        },
      ];

      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'tokenCards',
          card: token_card,
        },
      ]);
      return responseToOpenai('tell the user that the token data is fetched successfully');
    } catch (error) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: 'Oops! Encountered a problem while fetching token data.',
        },
      ]);
      return responseToOpenai(
        'tell the user that there has been a problem with fetching token data and ask them to try later',
      );
    }
  };

  const handleLSTData = async () => {
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Fetching lST Data`,
      },
    ]);
    try {
      const data = await getLstData();
      if (!data) {
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message: 'Oops! There has been a problem while fetching lst data',
          },
        ]);
        return responseToOpenai(
          'tell the user that there has been a problem while fetching lst data and ask them to try later',
        );
      }

      let lst_card: SanctumCard[] = data;

      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'sanctumCard',
          card: lst_card,
        },
      ]);
      return responseToOpenai(
        'tell the user that lst data is successfully fetched',
      );
    } catch (error) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: 'Oops! There has been a problem while fetching lst data',
        },
      ]);
      return responseToOpenai(
        'tell the user that there has been a problem while fetching lst data and ask them to try later',
      );
    }
  };

  const handleNFTPrice = async (nft: string) => {
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Fetching NFT Data`,
      },
    ]);

    try {
      let nft_symbol = nft.replace(/\s+/g, '_');
      const data = await fetchMagicEdenNFTPrice(nft, nft_symbol);
      if (!data) {
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message: 'Oops! There has been a problem while fetching NFT data',
          },
        ]);
        return responseToOpenai(
          'Tell the user that there has been a problem while fetching nft data and ask them to try later',
        );
      }

      let nft_card: NFTCollectionCard = data;

      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'nftCollectionCard',
          card: nft_card,
        },
      ]);

      return responseToOpenai(
        'tell the user that NFT data is successfully fetched',
      );
    } catch (error) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: 'Oops! There has been a problem while fetching NFT data',
        },
      ]);
      return responseToOpenai(
        'Tell the user that there has been a problem while fetching nft data and ask them to try later',
      );
    }
  };

  const handleTrendingNFTs = async () => {
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Fetching Trending NFTs`,
      },
    ]);

    try {
      const data = await fetchTrendingNFTs();
      if (!data) {
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message:
              'Oops! There has been a problem while fetching Trending NFT data',
          },
        ]);
        return responseToOpenai(
          'Tell the user that there has been a problem while fetching nft data and ask them to try later',
        );
      }

      let nft_card: TrendingNFTCard[] = data;

      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'trendingNFTCard',
          card: nft_card,
        },
      ]);

      return responseToOpenai(
        'tell the user NFT data is fetched',
      );
    } catch (error) {
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: 'Oops! There has been a problem while fetching NFT data',
        },
      ]);
      return responseToOpenai(
        'Tell the user that there has been a problem while fetching trending nfts and ask them to try later',
      );
    }
  };

  const handleLstSwaps = async (
    lst_amount: number,
    lst_symbol: string,
  ) => {

    let rpc = process.env.SOLANA_RPC_URL
    if (!rpc) { 
      console.log("rpc not set")
      return responseToOpenai("there has been a server error, prompt the user to try again later")
    }
    setMessageList((prev) => [
      ...(prev || []),
      {
        type: 'agent',
        message: `Swapping ${lst_amount} ${lst_symbol} from Solana`,
      },
    ]);
  
    try {
      //todo
      //create a fn to read sanctum list and fetch address
      let address = await fetchLSTAddress(lst_symbol);
      if (address == "") {
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message: `Problem while fetching LST address: ${lst_symbol}`,
          },
        ]);
        return responseToOpenai("error fetching in fetching lst address, prompt the user to try again")
      }

      let swapAmount = lst_amount;

      let params: SwapParams = {
        input_mint: tokenList.SOL.MINT,
        output_mint: address,
        public_key: appWallet.address,
        amount: swapAmount,
      }

      const transaction = await swapLST(params);
      if (!transaction) {
        setMessageList((prev) => [
          ...(prev || []),
          {
            type: 'message',
            message: `Error while creating the swap transaction: ${lst_symbol}`,
          },
        ]);
        return responseToOpenai("error while creating the transaction, prompt the user to try again")
      }
      let connection = new Connection(rpc);
      const signedTransaction = await appWallet.signTransaction(transaction);
      const serialzedTransaction = signedTransaction.serialize();
      const transactionSignature = await connection.sendRawTransaction(serialzedTransaction);

      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: `Transaction sent`,
          link: `https://solscan.io/tx/${transactionSignature}`,
        },
      ])
      
    }
    catch (error) {
      console.error(error);
      setMessageList((prev) => [
        ...(prev || []),
        {
          type: 'message',
          message: `Problem while swapping to LST:${error}`
          
        }
      ]
      )
    }
  }

  const test= async () => { 
    let address = await fetchLSTAddress("JupSOL")
  }

  const startSession = async () => {
    try {
      const tokenResponse = await fetch(
        'https://sola-proxy-server-eight.vercel.app/session',
      );
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
      const model = 'gpt-4o-realtime-preview-2024-12-17';

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
      if (dataChannel && dataChannel.readyState === 'open') {
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
    if (appWallet && audioElement.current && messageList) {
      setIsLoaded(true);
    }
  }, [appWallet, audioElement, messageList]);

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
            console.log(output);

            if (output.name === 'toggleWallet') {
              const { action } = JSON.parse(output.arguments);

              if (action === 'open' && !isWalletVisible) {
                toggleWallet();
              } else if (action === 'close' && isWalletVisible) {
                toggleWallet();
              }
              sendClientEvent(
                responseToOpenai('Ask what the user wants to do next.'),
              );
            } else if (output.name === 'transferSolTx') {
              const { quantity, address } = JSON.parse(output.arguments);
              let response = await transferSol(quantity, address);
              sendClientEvent(response);
            } else if (output.name === 'swapTokens') {
              const { quantity, tokenA, tokenB } = JSON.parse(output.arguments);
              let response = await handleSwap(quantity, tokenA, tokenB);
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
            } else if (output.name === 'getTokenDataSymbol') {
              const { symbol } = JSON.parse(output.arguments);
              let response = await handleTokenDataSymbol(symbol);
              sendClientEvent(response);
            } else if (output.name === 'swapLST') {
              const { quantity, lst } = JSON.parse(output.arguments);
              let response = await handleLstSwaps(quantity, lst);
              sendClientEvent(response);
            } else if (output.name === 'test') {
              let response = await test();
            } else if (output.name === 'transferSpl') {
              const { amount,token,address } = JSON.parse(output.arguments);
              let response = await transferSpl(amount, token, address);
              sendClientEvent(response);
            }else if (output.name === 'transferSpl') {
              const { amount,token,address } = JSON.parse(output.arguments);
              let response = await transferSpl(amount, token, address);
              sendClientEvent(response);
            } else if (output.name === 'fetchWallet') {
              let response = await fetchWallet()
              sendClientEvent(response);
            }
          }
        }
      }
    };

    handleEvents();
  }, [events, sendClientEvent]);

  return isLoaded ? (
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
          <section className="flex-grow flex justify-center items-start overflow-y-auto pb-20 no-scrollbar">
            <MessageList messageList={messageList} />
          </section>
        )}
        {/* End of Message display Section */}

        {/* Start of Session Controls Section */}

        {/* End of Session Controls Section */}
      </main>
      <section className="relative flex justify-center items-end w-full  bg-black">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 p-4 flex justify-center bg-white w-full">
          <SessionControls
            startSession={startSession}
            stopSession={stopSession}
            sendTextMessage={sendTextMessage}
            isSessionActive={isSessionActive}
          />
        </div>
      </section>
    </>
  ) : (
    <Loader />
  );
};

export default Conversation;
