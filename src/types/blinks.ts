export interface BlinkActionParameterOption {
  label: string;
  value: string;
  selected?: boolean;
}

export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?:
    | 'text'
    | 'email'
    | 'url'
    | 'number'
    | 'date'
    | 'datetime-local'
    | 'checkbox'
    | 'radio'
    | 'textarea'
    | 'select';
  pattern?: string;
  patternDescription?: string;
  min?: string | number;
  max?: string | number;
  options?: BlinkActionParameterOption[];
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

export interface BlinkTriggerRequest {
  blinkUrl: string;
  actionLabel?: string;
  actionHref?: string;
  parameters?: Record<string, string | number>;
  handsfree?: boolean;
  autoExecute?: boolean;
}

export interface BlinkExecutionResult {
  blinkUrl: string;
  executedHref: string;
  actionLabel: string;
  parameters?: Record<string, string | number>;
  transaction?: string;
  message?: string;
  handsfree: boolean;
  status: 'ready' | 'initiated' | 'completed' | 'error';
  error?: string;
}
