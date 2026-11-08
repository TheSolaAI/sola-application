import test, { describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  closeDocumentPiP,
  copyStylesToPiPWindow,
  isDocumentPiPSupported,
  requestDocumentPiP,
  shouldTriggerAutoPiP,
} from '../utils/pictureInPicture.ts';

describe('Document Picture-in-Picture Utilities (#388)', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).document = originalDocument;
  });

  describe('isDocumentPiPSupported', () => {
    test('returns false when window or documentPictureInPicture is undefined', () => {
      (globalThis as any).window = {};
      assert.strictEqual(isDocumentPiPSupported(), false);
    });

    test('returns true when documentPictureInPicture with requestWindow is defined', () => {
      (globalThis as any).window = {
        documentPictureInPicture: {
          requestWindow: async () => ({}),
        },
      };
      assert.strictEqual(isDocumentPiPSupported(), true);
    });
  });

  describe('requestDocumentPiP', () => {
    test('returns null when API is unsupported', async () => {
      (globalThis as any).window = {};
      const result = await requestDocumentPiP();
      assert.strictEqual(result, null);
    });

    test('calls requestWindow with default dimensions (360x180)', async () => {
      let capturedOptions: any = null;
      const mockHead = { appendChild: () => {} };
      const mockBody = { style: {} };
      const mockDoc = { head: mockHead, body: mockBody };
      const mockPipWindow = { document: mockDoc, addEventListener: () => {} };

      (globalThis as any).document = {
        head: { querySelectorAll: () => [] },
      };

      (globalThis as any).window = {
        documentPictureInPicture: {
          requestWindow: async (options: any) => {
            capturedOptions = options;
            return mockPipWindow;
          },
        },
      };

      const result = await requestDocumentPiP();
      assert.deepStrictEqual(capturedOptions, { width: 360, height: 180 });
      assert.strictEqual(result, mockPipWindow as any);
    });

    test('supports custom dimensions', async () => {
      let capturedOptions: any = null;
      (globalThis as any).document = {
        head: { querySelectorAll: () => [] },
      };
      (globalThis as any).window = {
        documentPictureInPicture: {
          requestWindow: async (options: any) => {
            capturedOptions = options;
            return {
              document: { head: { appendChild: () => {} }, body: { style: {} } },
            };
          },
        },
      };

      await requestDocumentPiP({ width: 420, height: 240 });
      assert.deepStrictEqual(capturedOptions, { width: 420, height: 240 });
    });

    test('catches rejections and returns null gracefully', async () => {
      (globalThis as any).window = {
        documentPictureInPicture: {
          requestWindow: async () => {
            throw new Error('User denied PiP permission');
          },
        },
      };

      const result = await requestDocumentPiP();
      assert.strictEqual(result, null);
    });
  });

  describe('copyStylesToPiPWindow', () => {
    test('copies style and link elements from parent document head into PiP head', () => {
      const appendedElements: any[] = [];
      const mockTargetHead = {
        appendChild: (el: any) => appendedElements.push(el),
      };
      const mockTargetBody = {
        style: {} as Record<string, string>,
      };
      const mockTargetWindow = {
        document: {
          head: mockTargetHead,
          body: mockTargetBody,
        },
      } as any;

      const fakeStyle = { cloneNode: () => ({ tagName: 'STYLE' }) };
      const fakeLink = { cloneNode: () => ({ tagName: 'LINK' }) };
      let queriedSelector = '';

      (globalThis as any).document = {
        head: {
          querySelectorAll: (selector: string) => {
            queriedSelector = selector;
            return selector === 'style, link[rel="stylesheet"]' ? [fakeStyle, fakeLink] : [];
          },
        },
      };

      copyStylesToPiPWindow(mockTargetWindow);
      assert.strictEqual(queriedSelector, 'style, link[rel="stylesheet"]');
      assert.strictEqual(appendedElements.length, 2);
      assert.strictEqual(mockTargetBody.style.backgroundColor, '#0b0b0e');
      assert.strictEqual(mockTargetBody.style.overflow, 'hidden');
    });

    test('handles null or invalid target without throwing', () => {
      assert.doesNotThrow(() => {
        copyStylesToPiPWindow(null as any);
        copyStylesToPiPWindow({} as any);
      });
    });
  });

  describe('closeDocumentPiP', () => {
    test('calls close on open window', () => {
      let closed = false;
      const mockWin = {
        closed: false,
        close: () => {
          closed = true;
        },
      } as any;

      closeDocumentPiP(mockWin);
      assert.strictEqual(closed, true);
    });

    test('ignores null or already closed windows', () => {
      let closeCalled = false;
      assert.doesNotThrow(() => {
        closeDocumentPiP(null);
        closeDocumentPiP({
          closed: true,
          close: () => {
            closeCalled = true;
          },
        } as any);
      });
      assert.strictEqual(closeCalled, false);
    });
  });

  describe('shouldTriggerAutoPiP', () => {
    test('returns true when tab is hidden, session is open, on desktop, and PiP not yet open', () => {
      const shouldTrigger = shouldTriggerAutoPiP({
        visibilityState: 'hidden',
        sessionState: 'open',
        isMobile: false,
        isPipOpen: false,
        autoPipEnabled: true,
      });
      assert.strictEqual(shouldTrigger, true);
    });

    test('returns false when document is visible', () => {
      const shouldTrigger = shouldTriggerAutoPiP({
        visibilityState: 'visible',
        sessionState: 'open',
        isMobile: false,
        isPipOpen: false,
      });
      assert.strictEqual(shouldTrigger, false);
    });

    test('returns false when session is idle, loading, or error', () => {
      assert.strictEqual(
        shouldTriggerAutoPiP({
          visibilityState: 'hidden',
          sessionState: 'idle',
          isMobile: false,
          isPipOpen: false,
        }),
        false
      );
      assert.strictEqual(
        shouldTriggerAutoPiP({
          visibilityState: 'hidden',
          sessionState: 'error',
          isMobile: false,
          isPipOpen: false,
        }),
        false
      );
    });

    test('returns false when client is mobile device', () => {
      const shouldTrigger = shouldTriggerAutoPiP({
        visibilityState: 'hidden',
        sessionState: 'open',
        isMobile: true,
        isPipOpen: false,
      });
      assert.strictEqual(shouldTrigger, false);
    });

    test('returns false when PiP window is already open', () => {
      const shouldTrigger = shouldTriggerAutoPiP({
        visibilityState: 'hidden',
        sessionState: 'open',
        isMobile: false,
        isPipOpen: true,
      });
      assert.strictEqual(shouldTrigger, false);
    });

    test('returns false when autoPiPEnabled is explicitly false', () => {
      const shouldTrigger = shouldTriggerAutoPiP({
        visibilityState: 'hidden',
        sessionState: 'open',
        isMobile: false,
        isPipOpen: false,
        autoPipEnabled: false,
      });
      assert.strictEqual(shouldTrigger, false);
    });
  });
});
