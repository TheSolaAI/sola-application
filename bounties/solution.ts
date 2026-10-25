// src/components/HandsfreeBlinks.tsx
import React, { useCallback, useEffect, useState } from "react";
import { BlinksProvider, useBlinks } from "@sola-ai/blinks";
import { registerCustomAction } from "../blinksConfig";

/**
 * Custom actions that can be triggered by the Handsfree UI.
 * Extend this map with any new actions you need.
 */
type ActionMap = {
  [actionName: string]: (payload?: any) => Promise<void>;
};

/**
 * HandsfreeBlinks
 *
 * A self‑contained functional component that:
 *  1. Registers custom actions with the Blinks AI config tool.
 *  2. Exposes UI controls (or can be used head‑less) to initiate those actions.
 *
 * Usage:
 *   <HandsfreeBlinks />
 */
export const HandsfreeBlinks: React.FC = () => {
  const { blinks } = useBlinks();
  const [isReady, setIsReady] = useState(false);

  /**
   * Core custom actions implementation.
   * Each function should call the underlying blockchain action via the
   * `blinks` SDK and handle any UI feedback / error handling.
   */
  const customActions: ActionMap = {
    // Example: send a token transfer
    async transferToken(payload) {
      const { to, amount, tokenId } = payload;
      await blinks.execute({
        action: "transfer",
        params: { to, amount, tokenId },
      });
    },

    // Example: mint an NFT
    async mintNft(payload) {
      const { metadataUri, recipient } = payload;
      await blinks.execute({
        action: "mint",
        params: { metadataUri, recipient },
      });
    },

    // Example: custom on‑chain greeting
    async greet(payload) {
      const { name } = payload;
      await blinks.execute({
        action: "greet",
        params: { name },
      });
    },
  };

  /**
   * Register the custom actions with the global config tool.
   * This makes them available to the AI‑driven “Blinks” engine.
   */
  useEffect(() => {
    if (!blinks) return;
    registerCustomAction(customActions);
    setIsReady(true);
  }, [blinks]);

  /**
   * Helper to invoke a custom action from UI or external callers.
   */
  const initiateAction = useCallback(
    async (actionName: keyof ActionMap, payload?: any) => {
      if (!isReady) {
        console.warn("HandsfreeBlinks not ready yet.");
        return;
      }
      const actionFn = customActions[actionName];
      if (!actionFn) {
        console.error(`Action "${actionName}" is not registered.`);
        return;
      }
      try {
        await actionFn(payload);
        console.info(`Action "${actionName}" executed successfully.`);
      } catch (err) {
        console.error(`Error executing "${actionName}":`, err);
      }
    },
    [isReady, customActions]
  );

  // -------------------------------------------------------------------------
  // UI – you can replace this with a hands‑free voice/gesture UI as needed.
  // -------------------------------------------------------------------------
  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>Handsfree Blinks Demo</h3>
      <button
        onClick={() =>
          initiateAction("transferToken", {
            to: "0xAbC123...def",
            amount: "10",
            tokenId: "USDC",
          })
        }
        disabled={!isReady}
      >
        Transfer Token
      </button>

      <button
        onClick={() =>
          initiateAction("mintNft", {
            metadataUri: "ipfs://QmExampleHash",
            recipient: "0xUserAddress...",
          })
        }
        disabled={!isReady}
        style={{ marginLeft: 8 }}
      >
        Mint NFT
      </button>

      <button
        onClick={() => initiateAction("greet", { name: "Alice" })}
        disabled={!isReady}
        style={{ marginLeft: 8 }}
      >
        Greet
      </button>
    </div>
  );
};

/**
 * Wrap the component with the BlinksProvider so it can be dropped into any
 * React tree without extra boilerplate.
 */
export const HandsfreeBlinksWrapper: React.FC = () => (
  <BlinksProvider>
    <HandsfreeBlinks />
  </BlinksProvider>
);