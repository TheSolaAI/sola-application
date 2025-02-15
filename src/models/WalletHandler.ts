import { create } from 'zustand';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { NFTAsset, TokenAsset, WalletAssets } from '../types/wallet.ts';

let connection = new Connection(process.env.SOLANA_RPC!, 'confirmed');

interface WalletHandler {
  currentWallet: ConnectedSolanaWallet | null; // The current wallet that the user is using
  defaultWallet: ConnectedSolanaWallet | null; // The default wallet that the user has set
  wallets: ConnectedSolanaWallet[]; // All connected wallets

  setWallets: (wallets: ConnectedSolanaWallet[]) => void; // Updates available wallets
  setCurrentWallet: (wallet: ConnectedSolanaWallet | null) => void; // Updates current wallet
  setDefaultWallet: (wallet: ConnectedSolanaWallet | null) => void; // Updates default wallet

  initWalletManager: () => void; // Initializes the wallet manager

  walletAssets: WalletAssets; // Stores balance, tokens and NFTs
  status: 'listening' | 'paused' | 'updating' | 'error' | 'initialLoad'; // Status of the wallet handler
  setStatus: (
    status: 'listening' | 'paused' | 'updating' | 'error' | 'initialLoad',
  ) => void; // Updates the status
  startMonitoring: (walletId: string, fresh: boolean) => void; // start monitoring the wallet
  stopMonitoring: () => void; // stop monitoring the wallet
}

export const useWalletHandler = create<WalletHandler>((set, get) => {
  let balanceSubscriptionId: number | null = null;

  const fetchTokensAndNFTs = async (walletId: string) => {
    if (get().status === 'paused') return;

    try {
      const response = await fetch(process.env.SOLANA_RPC!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'my-id',
          method: 'searchAssets',
          params: {
            ownerAddress: walletId,
            tokenType: 'all',
            page: 1,
            limit: 1000,
            displayOptions: {
              showNativeBalance: true,
              showInscription: false,
              showCollectionMetadata: false,
            },
          },
        }),
      });

      const { result } = await response.json();

      // Handle native SOL token (balance, price, etc.)
      const nativeSolToken = {
        imageLink: '/Solana_logo.png',
        id: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        balance: result.nativeBalance.lamports / Math.pow(10, 9),
        decimals: 9,
        pricePerToken: result.nativeBalance.price_per_sol,
        totalPrice: result.nativeBalance.total_price,
      };
      // Handle fungible tokens
      let tokens = result.items
        .filter((item: any) => item.interface === 'FungibleToken')
        .map((item: any) => ({
          id: item.id,
          symbol: item.content.metadata.symbol,
          name: item.content.metadata.name,
          balance:
            item.token_info.balance / Math.pow(10, item.token_info.decimals),
          decimals: item.token_info.decimals,
          pricePerToken: item.token_info.price_info?.price_per_token,
          totalPrice: item.token_info.price_info?.total_price,
          imageLink: item.content.links.image,
        }));

      // Handle NFTs
      const nfts: NFTAsset[] = result.items
        .filter((item: any) => item.interface === 'V1_NFT')
        .map((item: any) => {
          return {
            id: item.id,
            files: item.content.files.map((file: any) => ({
              uri: file.uri,
              type: getBasicType(file.mimeType),
            })),

            name: item.content.metadata.name,
            symbol: item.content.metadata.symbol,
            description: item.content.metadata.description,
            attributes: item.content.metadata.attributes,
          };
        });

      // remove any tokens that have a total price of 0 or undefined
      tokens = tokens.filter(
        (token: TokenAsset) => token.totalPrice && token.totalPrice > 0,
      );
      // Add the Sol balance
      tokens.unshift(nativeSolToken);

      // calculate the total balance
      const totalBalance = tokens.reduce(
        (acc: any, token: TokenAsset) => acc + token.totalPrice,
        0,
      );

      // Update the state with tokens and NFTs
      set((state) => ({
        walletAssets: {
          ...state.walletAssets,
          tokens: [...tokens],
          nfts,
          totalBalance,
        },
      }));
    } catch (error) {
      toast.error('Error Fetching Wallet Assets');
    }
  };

  return {
    currentWallet: null,
    defaultWallet: null,
    wallets: [],
    walletAssets: {
      totalBalance: null,
      tokens: [],
      nfts: [],
    },
    status: 'initialLoad',

    setWallets: (wallets) => set({ wallets }),
    setCurrentWallet: (wallet) => {
      // stop monitoring the previous wallet
      if (get().currentWallet) {
        get().stopMonitoring();
      }
      // start monitoring the new wallet
      if (wallet) {
        get().startMonitoring(wallet.address, true);
      }
      // load the initial tokens and NFTs
      set({ status: 'initialLoad' });
      fetchTokensAndNFTs(wallet?.address || '').then(() => {
        set({ status: 'listening' });
      });
      set({ currentWallet: wallet });
    },
    setDefaultWallet: (wallet) => {
      set({ defaultWallet: wallet });
      if (wallet) {
        localStorage.setItem('defaultWallet', wallet.address);
      }
    },

    /**
     * Initializes the wallet manager by loading the default wallet from localStorage.
     */
    initWalletManager: () => {
      const defaultWalletAddress = localStorage.getItem('defaultWallet');
      if (defaultWalletAddress) {
        const wallet = get().wallets.find(
          (w) => w.address === defaultWalletAddress,
        );
        if (wallet) {
          set({ currentWallet: wallet });
        } else {
          toast.error(
            "Your Default Wallet doesn't exist anymore, please select a new one.",
          );
          localStorage.setItem('defaultWallet', '');
          set({ defaultWallet: null });
          set({ currentWallet: get().wallets[0] });
        }
      } else {
        if (get().wallets.length === 0) {
          return;
        }
        set({ currentWallet: get().wallets[0] });
        localStorage.setItem('defaultWallet', get().wallets[0].address);
      }
      // fetch the tokens and NFTs for the default wallet
      fetchTokensAndNFTs(get().currentWallet?.address || '').then(() => {
        set({ status: 'listening' });
        // start the monitoring of the wallet
        get().startMonitoring(get().currentWallet?.address || '', true);
      });
    },

    startMonitoring: (walletId: string, fresh: boolean) => {
      // Set the current wallet if not already set
      if (!get().currentWallet || get().currentWallet?.address !== walletId) {
        const wallet =
          get().wallets.find((w) => w.address === walletId) || null;
        set({ currentWallet: wallet });
      }

      const publicKey = new PublicKey(walletId);
      balanceSubscriptionId = connection.onAccountChange(
        publicKey,
        async (accountInfo) => {
          if (get().status === 'paused') return; // if paused, do not update the wallet assets
          // set the status to updating
          set({ status: 'updating' });
          const balance = accountInfo.lamports / LAMPORTS_PER_SOL;
          set((state) => ({
            walletAssets: {
              ...state.walletAssets,
              balance,
            },
          }));
          if (get().status === 'paused') return; // if paused, do not update the wallet assets
          await fetchTokensAndNFTs(walletId);
          if (get().status === 'paused') return; // Check after long running operation
          set({ status: 'listening' });
        },
      );
      if (!fresh) {
        set({ status: 'listening' });
        toast.success('Wallet monitoring started');
      }
    },

    stopMonitoring: () => {
      if (balanceSubscriptionId !== null) {
        connection.removeAccountChangeListener(balanceSubscriptionId);
        balanceSubscriptionId = null;
        set(() => ({ status: 'paused' }));
        toast.error('Wallet monitoring paused');
      }
    },

    setStatus: (status) => set({ status }),
  };
});

function getBasicType(
  mimeType: string,
): 'image' | 'video' | 'document' | 'model' | 'audio' | 'unknown' {
  const imageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ];
  const videoTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/x-msvideo',
    'video/mpeg',
  ];
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/html',
    'application/json',
  ];
  const modelTypes = [
    'model/gltf+json',
    'model/gltf-binary',
    'model/obj',
    'model/stl',
    'model/vnd.collada+xml',
  ];
  const audioTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
  ];

  if (imageTypes.includes(mimeType)) return 'image';
  if (videoTypes.includes(mimeType)) return 'video';
  if (documentTypes.includes(mimeType)) return 'document';
  if (modelTypes.includes(mimeType)) return 'model';
  if (audioTypes.includes(mimeType)) return 'audio';

  return 'unknown';
}
