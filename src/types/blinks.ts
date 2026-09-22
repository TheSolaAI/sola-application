export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
}

export interface BlinkAction {
  label: string;
  href: string;
  parameters?: BlinkActionParameter[];
}

export interface BlinkMetadata {
  kind: 'metadata';
  url: string;
  icon?: string;
  title: string;
  description?: string;
  disabled?: boolean;
  actions: BlinkAction[];
}

export interface BlinkPreparedAction {
  kind: 'prepared';
  url: string;
  actionHref: string;
  actionLabel: string;
  message?: string;
  transactionHash: string;
}

export type BlinkActionResultData = BlinkMetadata | BlinkPreparedAction;
