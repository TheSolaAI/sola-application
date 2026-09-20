/**
 * Types for Solana Actions ("blinks") following the Solana Actions spec.
 * @see https://solana.com/docs/advanced/actions
 */

export interface BlinkActionParameter {
  name: string;
  label?: string;
  required?: boolean;
  type?: string;
}

export interface BlinkLinkedAction {
  label: string;
  href: string;
  type?: string;
  parameters?: BlinkActionParameter[];
}

/** GET response returned by a Solana Action endpoint. */
export interface BlinkActionMetadata {
  icon: string;
  title: string;
  description: string;
  label?: string;
  disabled?: boolean;
  error?: { message: string };
  links?: {
    actions?: BlinkLinkedAction[];
  };
}

/** POST response returned by a Solana Action endpoint. */
export interface BlinkActionTransaction {
  /** base64 encoded serialized transaction */
  transaction: string;
  message?: string;
}
