/**
 * Picture-in-Picture utility functions for Document Picture-in-Picture API
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API
 */

export interface DocumentPiPOptions {
  width?: number;
  height?: number;
}

export const DEFAULT_PIP_DIMENSIONS: DocumentPiPOptions = {
  width: 360,
  height: 180,
};

/**
 * Checks whether the Document Picture-in-Picture API is supported in current environment
 */
export function isDocumentPiPSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'documentPictureInPicture' in window &&
    typeof (window as any).documentPictureInPicture?.requestWindow === 'function'
  );
}

/**
 * Requests a Document Picture-in-Picture window with fallback error handling
 */
export async function requestDocumentPiP(
  options?: DocumentPiPOptions
): Promise<Window | null> {
  if (!isDocumentPiPSupported()) {
    console.warn('[PiP] Document Picture-in-Picture API is not supported on this browser.');
    return null;
  }

  const dimensions = {
    width: options?.width ?? DEFAULT_PIP_DIMENSIONS.width,
    height: options?.height ?? DEFAULT_PIP_DIMENSIONS.height,
  };

  try {
    const pipWindow: Window = await (window as any).documentPictureInPicture.requestWindow(
      dimensions
    );
    copyStylesToPiPWindow(pipWindow);
    return pipWindow;
  } catch (error: any) {
    console.warn('[PiP] Failed to open Picture-in-Picture window:', error?.message || error);
    return null;
  }
}

/**
 * Copies parent document stylesheets and style elements to the PiP window so styling remains consistent
 */
export function copyStylesToPiPWindow(targetWindow: Window): void {
  if (!targetWindow || !targetWindow.document || typeof document === 'undefined') {
    return;
  }

  try {
    const parentHead = document.head;
    const targetHead = targetWindow.document.head;

    // Copy all style sheets and style tags
    const styleElements = parentHead.querySelectorAll('style, link[rel="stylesheet"]');
    styleElements.forEach((el) => {
      targetHead.appendChild(el.cloneNode(true));
    });

    // Set dark background and default font family for consistent layout
    targetWindow.document.body.style.margin = '0';
    targetWindow.document.body.style.padding = '0';
    targetWindow.document.body.style.backgroundColor = '#0b0b0e';
    targetWindow.document.body.style.color = '#ffffff';
    targetWindow.document.body.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    targetWindow.document.body.style.overflow = 'hidden';
  } catch (error) {
    console.warn('[PiP] Error copying styles to PiP window:', error);
  }
}

/**
 * Safely closes an open PiP window
 */
export function closeDocumentPiP(pipWindow?: Window | null): void {
  if (pipWindow && !pipWindow.closed) {
    try {
      pipWindow.close();
    } catch (e) {
      console.warn('[PiP] Error closing PiP window:', e);
    }
  }
}

export interface ShouldTriggerAutoPiPParams {
  visibilityState: DocumentVisibilityState | string;
  sessionState: string;
  isMobile: boolean;
  isPipOpen: boolean;
  autoPipEnabled?: boolean;
}

/**
 * Determines whether Picture-in-Picture should automatically activate on visibility change
 */
export function shouldTriggerAutoPiP(params: ShouldTriggerAutoPiPParams): boolean {
  const { visibilityState, sessionState, isMobile, isPipOpen, autoPipEnabled = true } =
    params;

  if (!autoPipEnabled) return false;
  if (isMobile) return false;
  if (isPipOpen) return false;
  if (visibilityState !== 'hidden') return false;
  if (sessionState !== 'open') return false;

  return true;
}
