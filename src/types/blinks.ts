export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
}

export interface BlinkLinkedAction {
  label: string;
  href: string;
  parameters?: BlinkActionParameter[];
}

export interface BlinkActionMetadata {
  icon: string;
  title: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions: BlinkLinkedAction[];
  };
  errorMessage?: string;
}

export interface BlinkActionResponse {
  transaction: string;
  message?: string;
}

export interface BlinkToolInput {
  game?: 'coinflip' | 'rockpaperscissors' | 'dice' | 'prediction' | 'custom';
  actionUrl: string;
  autoTrigger?: boolean;
  params?: Record<string, any>;
}

export interface BlinkRenderResult {
  actionUrl: string;
  title: string;
  description: string;
  game?: string;
  autoTrigger: boolean;
  params?: Record<string, any>;
}
