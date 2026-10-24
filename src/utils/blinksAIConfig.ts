export interface BlinkAIConfig {
  actionUrl: string;
  autoTrigger: boolean;
  customParameters?: Record<string, any>;
}

export class BlinksAIConfigTool {
  private config: BlinkAIConfig;

  constructor(config: BlinkAIConfig) {
    this.config = config;
  }

  public async triggerHandsfreeAction(customHandler?: (result: any) => void): Promise<any> {
    try {
      const response = await fetch(this.config.actionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config.customParameters || {}),
      });
      const data = await response.json();
      if (customHandler) {
        customHandler(data);
      }
      return data;
    } catch (error) {
      console.error('Error triggering handsfree blink action via AI config tool:', error);
      throw error;
    }
  }

  public updateConfig(newConfig: Partial<BlinkAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): BlinkAIConfig {
    return this.config;
  }
}
