// Domain contracts for Solana Actions and Blinks (Blockchain Links) execution.
// Defines action metadata, parameter schemas, and transaction payload structures
// required for handsfree voice and chat execution within Sola AI.

export interface BlinkParameterOption {
  label: string;
  value: string;
}

export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
  pattern?: string;
  min?: number;
  max?: number;
  options?: BlinkParameterOption[];
}

export interface BlinkActionLink {
  label: string;
  href: string;
  parameters?: BlinkActionParameter[];
}

export interface BlinkActionMetadata {
  title: string;
  icon: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions: BlinkActionLink[];
  };
  error?: {
    message: string;
  };
}

export interface BlinkExecutionRequest {
  actionUrl: string;
  account: string;
  parameters?: Record<string, string | number>;
}

export interface BlinkTransactionResponse {
  transaction: string;
  message?: string;
}

export interface BlinkActionToolData {
  actionUrl: string;
  metadata: BlinkActionMetadata;
  selectedActionHref?: string;
  selectedActionLabel?: string;
  parameters?: Record<string, string | number>;
  transactionHash?: string;
  autoExecute?: boolean;
  message?: string;
}
