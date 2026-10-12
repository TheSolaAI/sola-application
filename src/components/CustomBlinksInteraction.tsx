import React, { forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { Blink, CustomBlinksInteractionRef } from '../types/blinks'; // Adjust path as needed
import './CustomBlinksInteraction.css'; // For basic styling

interface CustomBlinksInteractionProps {
  blinks: Blink[];
  onActionTrigger: (blinkId: string, actionIndex: number) => void;
  // Add any other props needed for rendering or context
}

const CustomBlinksInteraction = forwardRef<CustomBlinksInteractionRef, CustomBlinksInteractionProps>(
  ({ blinks, onActionTrigger }, ref) => {
    // Internal state to manage any visual feedback or active blink
    const [activeBlinkId, setActiveBlinkId] = useState<string | null>(null);
    const [activeActionIndex, setActiveActionIndex] = useState<number | null>(null);

    // Function to simulate a click on a Blink action
    const triggerBlinkAction = useCallback((blinkId: string, actionIndex: number) => {
      console.log(`[CustomBlinksInteraction] Triggering action for Blink ID: ${blinkId}, Action Index: ${actionIndex}`);
      setActiveBlinkId(blinkId);
      setActiveActionIndex(actionIndex);

      // Simulate a brief visual feedback or delay if necessary
      setTimeout(() => {
        onActionTrigger(blinkId, actionIndex);
        setActiveBlinkId(null);
        setActiveActionIndex(null);
      }, 200); // Small delay for visual feedback
    }, [onActionTrigger]);

    // Expose the triggerBlinkAction function to the parent component via ref
    useImperativeHandle(ref, () => ({
      triggerBlinkAction,
    }));

    return (
      <div className="custom-blinks-container">
        <h2>Hands-Free Blinks</h2>
        {blinks.length === 0 ? (
          <p>No Blinks available.</p>
        ) : (
          <div className="blinks-grid">
            {blinks.map((blink) => (
              <div key={blink.id} className={`blink-card ${activeBlinkId === blink.id ? 'active-blink' : ''}`}>
                <div className="blink-header">
                  {blink.icon && <img src={blink.icon} alt="Blink Icon" className="blink-icon" />}
                  <h3>{blink.title}</h3>
                </div>
                <p className="blink-description">{blink.description}</p>
                <div className="blink-actions">
                  {blink.actions.map((action, index) => (
                    <button
                      key={index}
                      className={`blink-action-button ${
                        activeBlinkId === blink.id && activeActionIndex === index ? 'active-action' : ''
                      }`}
                      onClick={() => triggerBlinkAction(blink.id, index)}
                      // Disable direct clicks if you want to strictly enforce hands-free via AI
                      // disabled={true}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

CustomBlinksInteraction.displayName = 'CustomBlinksInteraction';

export default CustomBlinksInteraction;
