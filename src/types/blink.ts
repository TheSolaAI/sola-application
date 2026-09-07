export type LinkedActionType =
  | 'transaction'
  | 'message'
  | 'post'
  | 'external-link';

export type ActionParameterType =
  | 'text'
  | 'email'
  | 'url'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox';

export interface BlinkParameterOption {
  label: string;
  value: string;
  selected?: boolean;
}

export interface BlinkParameter {
  name: string;
  label?: string;
  type?: ActionParameterType;
  required?: boolean;
  pattern?: string;
  patternDescription?: string;
  min?: number | string;
  max?: number | string;
  options?: BlinkParameterOption[];
}

export interface BlinkLinkedAction {
  type?: LinkedActionType;
  href: string;
  label: string;
  parameters?: BlinkParameter[];
}

export interface BlinkActionError {
  message: string;
}

export interface BlinkMetadata {
  type?: 'action' | 'completed';
  title?: string;
  description?: string;
  icon?: string;
  label?: string;
  disabled?: boolean;
  error?: BlinkActionError;
  links?: {
    actions?: BlinkLinkedAction[];
    next?:
      | { type: 'post'; href: string }
      | { type: 'inline'; action: BlinkMetadata };
  };
}

export interface BlinkToolData {
  actionUrl: string;
  actionName?: string;
  title?: string;
  label?: string;
  params?: Record<string, string>;
  account?: string;
  autoExecute?: boolean;
}

export interface BlinkExecutePayload {
  type?: LinkedActionType;
  transaction?: string;
  message?: string;
  data?: string | Record<string, unknown>;
  externalLink?: string;
  state?: string;
  links?: BlinkMetadata['links'];
}

export interface BlinkProxyResponse {
  metadata?: BlinkMetadata;
  payload?: BlinkExecutePayload;
  error?: string;
}
