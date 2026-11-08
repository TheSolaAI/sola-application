'use client';
import React, { FC } from 'react';
import { useSessionHandler } from '@/store/SessionHandler';

interface PipSessionControlsProps {
  onClosePip?: () => void;
}

export const PipSessionControls: FC<PipSessionControlsProps> = ({ onClosePip }) => {
  const {
    state,
    muted,
    setMuted,
    isUserSpeaking,
    dataStream,
    setDataStream,
    mediaStream,
    setMediaStream,
    peerConnection,
    setPeerConnection,
  } = useSessionHandler();

  const handleToggleMute = () => {
    const nextMuted = !muted;
    if (mediaStream) {
      try {
        const audioTracks =
          typeof mediaStream.getAudioTracks === 'function'
            ? mediaStream.getAudioTracks()
            : mediaStream.getTracks();
        audioTracks.forEach((track) => {
          track.enabled = !nextMuted;
        });
      } catch (e) {
        console.warn('Error toggling microphone audio tracks:', e);
      }
    }
    setMuted(nextMuted);
  };

  const handleEndSession = () => {
    if (dataStream) {
      try {
        dataStream.close();
      } catch (e) {
        console.warn('Error closing dataStream:', e);
      }
      setDataStream(null);
    }

    if (mediaStream) {
      try {
        mediaStream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn('Error stopping media tracks:', e);
      }
      setMediaStream(null);
    }

    if (peerConnection) {
      try {
        peerConnection.close();
      } catch (e) {
        console.warn('Error closing peerConnection:', e);
      }
      setPeerConnection(null);
    }

    setMuted(true);
    useSessionHandler.setState({ state: 'idle' });

    if (onClosePip) {
      onClosePip();
    }
  };

  const handleReturnToTab = () => {
    if (typeof window !== 'undefined' && window.opener) {
      window.opener.focus();
    }
    if (onClosePip) {
      onClosePip();
    }
  };

  const isLive = state === 'open';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '12px 16px',
        backgroundColor: '#0c0c10',
        color: '#f3f4f6',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        userSelect: 'none',
      }}
    >
      {/* Header with Status Pill and Return to Tab */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#181820',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: '1px solid #282834',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: !isLive ? '#ef4444' : muted ? '#eab308' : '#22c55e',
              boxShadow: !isLive
                ? '0 0 8px #ef4444'
                : muted
                ? '0 0 8px #eab308'
                : '0 0 8px #22c55e',
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em' }}>
            {!isLive
              ? 'Disconnected'
              : muted
              ? 'Muted'
              : isUserSpeaking
              ? 'Speaking...'
              : 'Sola Active'}
          </span>
        </div>

        <button
          onClick={handleReturnToTab}
          title="Return to Sola tab"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '11px',
            padding: '4px 6px',
            borderRadius: '6px',
            transition: 'color 0.2s',
          }}
        >
          <span>Expand</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>

      {/* Control Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          width: '100%',
          marginTop: '8px',
        }}
      >
        {/* Mute / Unmute Button */}
        <button
          onClick={handleToggleMute}
          title={muted ? 'Unmute microphone' : 'Mute microphone'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: muted ? '#ef4444' : '#272733',
            color: '#ffffff',
            border: muted ? '1px solid #f87171' : '1px solid #3f3f50',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: muted ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
          }}
        >
          {muted ? (
            /* Microphone Off SVG */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            /* Microphone On SVG */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {/* End Session Button */}
        <button
          onClick={handleEndSession}
          title="End session"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: '1px solid #b91c1c',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)',
          }}
        >
          {/* Phone Off / Disconnect SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.12-8.69A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </button>
      </div>

      {/* Footer Branding / Hint */}
      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '6px' }}>
        Sola AI Session Control
      </div>
    </div>
  );
};
