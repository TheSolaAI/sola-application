import { Action } from '@solana/actions';

export interface HandsfreeBlinkToolConfig {
  url: string;
  action: Action;
  onSuccess?: (result: any) => void;
}

/**
 * AI Tool integration for triggering Blinks in a handsfree manner.
 * Extends the AI config tool set to programmatically execute actions.
 */
export class HandsfreeBlinkToolExecutor {
  private action: Action;
  private url: string;
  private onSuccess?: (result: any) => void;

  constructor(config: HandsfreeBlinkToolConfig) {
    this.action = config.action;
    this.url = config.url;
    this.onSuccess = config.onSuccess;
  }

  public async executeHandsfreeAction(parameters?: Record<string, any>): Promise<any> {
    try {
      // Execute blink action endpoint directly via Solana Actions protocol or API
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: parameters?.account || '',
          data: parameters,
        }),
      });

      const result = await response.json();
      if (this.onSuccess) {
        this.onSuccess(result);
      }
      return result;
    } catch (error) {
      console.error('Error in HandsfreeBlinkToolExecutor:', error);
      throw error;
    }
  }
}
