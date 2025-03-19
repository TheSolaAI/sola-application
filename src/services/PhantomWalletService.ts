import { Phantom } from '@phantom/wallet-sdk';

export class PhantomWalletService {
  private static instance: PhantomWalletService;
  private phantomInstance: Phantom | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PhantomWalletService {
    if (!PhantomWalletService.instance) {
      PhantomWalletService.instance = new PhantomWalletService();
    }
    return PhantomWalletService.instance;
  }

  public async initialize(): Promise<Phantom | null> {
    if (!this.isInitialized) {
      try {
        const { createPhantom, Position } = await import('@phantom/wallet-sdk');
        this.phantomInstance = await createPhantom({
          position: Position.bottomRight,
          hideLauncherBeforeOnboarded: false,
          namespace: 'phantom-embedded',
        });
        this.isInitialized = true;
      } catch (error) {
        console.error('Error initializing Phantom wallet:', error);
      }
    }
    return this.phantomInstance;
  }

  public async getPhantomInstance(): Promise<Phantom | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.phantomInstance;
  }
}
