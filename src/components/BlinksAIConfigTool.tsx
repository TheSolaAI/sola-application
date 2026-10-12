import React, { useRef, useState, useEffect, useCallback } from 'react';
import CustomBlinksInteraction from './CustomBlinksInteraction'; // Adjust path as needed
import { Blink, CustomBlinksInteractionRef } from '../types/blinks'; // Adjust path as needed

// --- Mock Data and Functions (Replace with actual Sola AI integration) ---
// This section simulates how Blinks data and action execution might look in Sola AI.
const mockBlinks: Blink[] = [
  {
    id: 'blink-1',
    title: 'Swap SOL',
    description: 'Swap SOL for USDC on Jupiter.',
    icon: 'https://www.svgrepo.com/show/374092/solana.svg',
    actions: [
      { label: 'Swap 0.1 SOL', url: 'https://jup.ag/swap?inputMint=SOL&outputMint=USDC&amount=0.1' },
      { label: 'Swap 0.5 SOL', url: 'https://jup.ag/swap?inputMint=SOL&outputMint=USDC&amount=0.5' },
    ],
  },
  {
    id: 'blink-2',
    title: 'Stake SOL',
    description: 'Stake your SOL with a validator.',
    icon: 'https://www.svgrepo.com/show/374092/solana.svg',
    actions: [
      { label: 'Stake 1 SOL', url: 'https://solana.com/stake' },
      { label: 'Stake 5 SOL', url: 'https://solana.com/stake' },
    ],
  },
  {
    id: 'blink-3',
    title: 'Mint NFT',
    description: 'Mint a new NFT from a collection.',
    icon: 'https://www.svgrepo.com/show/473618/nft.svg',
    actions: [
      { label: 'Mint Common', url: 'https://magiceden.io/mint' },
      { label: 'Mint Rare', url: 'https://magiceden.io/mint' },
    ],
  },
];

// This function would typically interact with the Solana blockchain or a backend service
const executeBlinkAction = (blinkId: string, actionIndex: number) => {
  const blink = mockBlinks.find(b => b.id === blinkId);
  if (blink && blink.actions[actionIndex]) {
    const action = blink.actions[actionIndex];
    console.log(`[BlinksAIConfigTool] Executing Blink Action: "${action.label}" for Blink ID: "${blinkId}"`);
    // In a real application, this would trigger a transaction or navigate to the URL
    // For demonstration, we'll just log and potentially open a new tab.
    // window.open(action.url, '_blank');
    alert(`AI executed: "${action.label}" for "${blink.title}"`);
  } else {
    console.error(`[BlinksAIConfigTool] Blink or action not found for ID: ${blinkId}, Index: ${actionIndex}`);
  }
};
// --- End Mock Data and Functions ---


const BlinksAIConfigTool: React.FC = () => {
  const customBlinksRef = useRef<CustomBlinksInteractionRef>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiActionLog, setAiActionLog] = useState<string[]>([]);
  const [selectedBlinkId, setSelectedBlinkId] = useState<string>('');
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1);

  // This function is passed to CustomBlinksInteraction to handle the actual execution
  const handleBlinkActionTrigger = useCallback((blinkId: string, actionIndex: number) => {
    executeBlinkAction(blinkId, actionIndex);
    setAiActionLog(prev => [...prev, `User/AI triggered: Blink ID "${blinkId}", Action Index "${actionIndex}"`]);
  }, []);

  // Simulate AI making a decision and triggering an action
  useEffect(() => {
    if (aiEnabled && customBlinksRef.current) {
      const aiDecisionInterval = setInterval(() => {
        // AI Logic: Randomly pick a blink and an action
        if (mockBlinks.length > 0) {
          const randomBlinkIndex = Math.floor(Math.random() * mockBlinks.length);
          const randomBlink = mockBlinks[randomBlinkIndex];
          if (randomBlink.actions.length > 0) {
            const randomActionIndex = Math.floor(Math.random() * randomBlink.actions.length);

            console.log(`AI decided to trigger: Blink ID "${randomBlink.id}", Action Index "${randomActionIndex}"`);
            setAiActionLog(prev => [...prev, `AI decision: Blink ID "${randomBlink.id}", Action Index "${randomActionIndex}"`]);

            // This is the key part: AI calls the custom component's exposed function
            customBlinksRef.current.triggerBlinkAction(randomBlink.id, randomActionIndex);
          }
        }
      }, 5000); // AI makes a decision every 5 seconds

      return () => clearInterval(aiDecisionInterval);
    }
  }, [aiEnabled]);

  const handleManualAITrigger = () => {
    if (customBlinksRef.current && selectedBlinkId && selectedActionIndex !== -1) {
      console.log(`Manually triggering AI action: Blink ID "${selectedBlinkId}", Action Index "${selectedActionIndex}"`);
      setAiActionLog(prev => [...prev, `Manual AI trigger: Blink ID "${selectedBlinkId}", Action Index "${selectedActionIndex}"`]);
      customBlinksRef.current.triggerBlinkAction(selectedBlinkId, selectedActionIndex);
    } else {
      alert('Please select a Blink and an Action to manually trigger.');
    }
  };

  return (
    <div className="ai-config-tool-container">
      <h1>Blinks AI Configuration Tool</h1>

      <div className="ai-controls">
        <label>
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
          />
          Enable Autonomous AI Interaction
        </label>
        {aiEnabled && <p className="ai-status">AI is actively interacting with Blinks...</p>}
      </div>

      <div className="manual-ai-trigger">
        <h3>Manual AI Trigger</h3>
        <select
          value={selectedBlinkId}
          onChange={(e) => {
            setSelectedBlinkId(e.target.value);
            setSelectedActionIndex(-1); // Reset action when blink changes
          }}
        >
          <option value="">Select a Blink</option>
          {mockBlinks.map(blink => (
            <option key={blink.id} value={blink.id}>{blink.title}</option>
          ))}
        </select>

        {selectedBlinkId && (
          <select
            value={selectedActionIndex}
            onChange={(e) => setSelectedActionIndex(parseInt(e.target.value))}
          >
            <option value="-1">Select an Action</option>
            {mockBlinks.find(b => b.id === selectedBlinkId)?.actions.map((action, index) => (
              <option key={index} value={index}>{action.label}</option>
            ))}
          </select>
        )}
        <button onClick={handleManualAITrigger} disabled={!selectedBlinkId || selectedActionIndex === -1}>
          Trigger Selected Action via AI
        </button>
      </div>

      <CustomBlinksInteraction
        ref={customBlinksRef}
        blinks={mockBlinks} // Pass your actual blinks data here
        onActionTrigger={handleBlinkActionTrigger}
      />

      <div className="ai-action-log">
        <h3>AI Action Log</h3>
        {aiActionLog.length === 0 ? (
          <p>No AI actions yet.</p>
        ) : (
          <ul>
            {aiActionLog.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BlinksAIConfigTool;
