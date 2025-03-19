'use client';

import {
  ConnectedSolanaWallet,
  SolanaFundingConfig,
} from '@privy-io/react-auth';
import {
  Connection,
  PublicKey,
  SendOptions,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { PhantomWalletService } from '@/services/PhantomWalletService';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import SolanaProvider from '@walletconnect/universal-provider/dist/types/providers/solana';
import { toast } from 'sonner';

/*
 * ConnectedPhantomWallet implements ConnectedSolanaWallet to make it comparable
 * with privy wallets array. Since this structure is internally used
 * in the app.
 * */
export class ConnectedPhantomWallet implements ConnectedSolanaWallet {
  type: 'solana';
  address: string;
  connectedAt: number;
  walletClientType: string;
  connectorType: string;
  imported: boolean = false;
  meta: {
    id: string;
    icon: string;
    name: string;
    rdns?: string;
  };
  linked: boolean = false;
  walletIndex?: number;

  // Private properties
  private phantomService: PhantomWalletService;
  private _isConnected: boolean = false;
  private publicKey: PublicKey | null = null;

  constructor(address: string = '') {
    this.type = 'solana';
    this.address = address;
    this.walletClientType = 'phantom-embedded';
    this.connectorType = 'embedded';
    this.connectedAt = Date.now();
    this.meta = {
      id: this.connectorType,
      icon: '/phantom-icon.svg',
      name: 'Phantom Embedded',
      rdns: 'docs.phantom.com',
    };
    this.phantomService = PhantomWalletService.getInstance();
  }

  async isConnected(): Promise<boolean> {
    return this._isConnected;
  }

  disconnect(): void {
    this._isConnected = false;
  }

  async getProvider(): Promise<SolanaProvider> {
    if (!this._isConnected) {
      await this.connect();
    }

    const phantom = await this.phantomService.getPhantomInstance();
    if (!phantom) throw new Error('Phantom not initialized');

    // Create a provider that wraps Phantom's solana interface
    return {
      publicKey: this.publicKey,
      connected: this._isConnected,
      signMessage: this.signMessage.bind(this),
      signTransaction: this.signTransaction.bind(this),
      signAllTransactions: this.signAllTransactions.bind(this),
      sendTransaction: this.sendTransaction.bind(this),
      connect: this.connect.bind(this),
      disconnect: this.disconnect.bind(this),
    };
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    const phantom = await this.phantomService.getPhantomInstance();
    if (!phantom) throw new Error('Phantom not initialized');
    if (!this._isConnected) throw new Error('Wallet not connected');

    try {
      const signature = await phantom.solana.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    const phantom = await this.phantomService.getPhantomInstance();
    if (!phantom) throw new Error('Phantom not initialized');
    if (!this._isConnected) throw new Error('Wallet not connected');

    try {
      const signedTransaction =
        await phantom.solana.signTransaction(transaction);
      return signedTransaction as T;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    const phantom = await this.phantomService.getPhantomInstance();
    if (!phantom) throw new Error('Phantom not initialized');
    if (!this._isConnected) throw new Error('Wallet not connected');

    try {
      const signedTransactions =
        await phantom.solana.signAllTransactions(transactions);
      return signedTransactions as T[];
    } catch (error) {
      console.error('Error signing transactions:', error);
      throw error;
    }
  }

  /*
   * Mostly this method won't be used in the app cause when implementing this method
   * in privy embedded wallet the connection object will be revealed in the client
   * side, which will expose the secrets. Therefore avoiding this is a better option
   *
   * This method defined is just a wrapper to bind with the SolanaConnectedWallet type.
   */
  async sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    connection: Connection,
    options?: SendOptions
  ): Promise<string> {
    const phantom = await this.phantomService.getPhantomInstance();
    if (!phantom) throw new Error('Phantom not initialized');
    if (!this._isConnected) throw new Error('Wallet not connected');

    try {
      // Note: We're not actually using the connection and options here,
      // as Phantom's signAndSendTransaction handles this internally
      return await phantom.solana.signAndSendTransaction(transaction);
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  async loginOrLink(): Promise<void> {
    if (!this._isConnected) {
      await this.connect();
    }
    this.linked = true;
  }

  async unlink(): Promise<void> {
    this.linked = false;
  }

  //TODO: Implement a component to render the funding screen. like a QR or similar
  async fund(fundWalletConfig?: SolanaFundingConfig): Promise<void> {
    console.log(fundWalletConfig);
  }

  /*
   * Method to connect the wallet. This has to be called whenever the user wants
   * to switch to Phantom Embedded Wallet.
   *
   * We have to call this even though the user is already connected cause there
   * is no other way to get the public key from the phantom embedded wallet.
   */
  async connect(): Promise<string | null> {
    try {
      const phantom = await this.phantomService.getPhantomInstance();
      if (!phantom) {
        toast.error('Phantom not initialized');
        return null;
      }
      const result = await phantom.solana.connect();

      const publicKey = result.publicKey ? result.publicKey : result;
      if (publicKey) {
        this.address = publicKey.toString();
        this._isConnected = true;
        this.publicKey = publicKey;
        this.connectedAt = Date.now();
        return this.address;
      }

      return null;
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      this._isConnected = false;
      return null;
    }
  }

  getConnectionStatus(): boolean {
    return this._isConnected;
  }
}
