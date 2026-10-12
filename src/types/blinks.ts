// Assuming this file exists or creating a new one for Blink-related types.

export interface BlinkAction {
  label: string;
  url: string;
  // Add any other properties relevant to a Blink action
}

export interface Blink {
  id: string; // Unique identifier for the blink
  title: string;
  description: string;
  icon: string;
  actions: BlinkAction[];
  // Add any other properties relevant to a Blink
}

// Interface for the functions exposed by CustomBlinksInteraction
export interface CustomBlinksInteractionRef {
  triggerBlinkAction: (blinkId: string, actionIndex: number) => void;
  // Add other hands-free interaction functions if needed in the future
}
