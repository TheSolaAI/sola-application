export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'email' | 'url' | 'date' | 'datetime-local' | 'checkbox' | 'radio' | 'textarea' | 'select';
  pattern?: string;
  patternDescription?: string;
  min?: number | string;
  max?: number | string;
  options?: Array<{ label: string; value: string; selected?: boolean }>;
}

export interface BlinkLinkedAction {
  href: string;
  label: string;
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
  error?: {
    message: string;
  };
}

export interface HandsfreeBlinkCommand {
  actionUrl: string;
  actionLabelOrHref?: string;
  params?: Record<string, string | number | boolean>;
  account?: string;
  autoExecute?: boolean;
  autoSignAndSend?: boolean;
}

export interface BlinkTransactionPayload {
  transaction: string;
  message?: string;
}

export interface BlinkExecutionResult {
  success: boolean;
  actionUrl: string;
  executedHref: string;
  transaction?: string;
  message?: string;
  metadata?: BlinkActionMetadata;
  signAndSend?: boolean;
  error?: string;
}

export interface BlinkMessageItemProps {
  actionUrl: string;
  metadata?: BlinkActionMetadata;
  autoExecuteAction?: string;
  autoParams?: Record<string, string | number | boolean>;
  account?: string;
  transaction?: string;
  message?: string;
  signAndSend?: boolean;
}
