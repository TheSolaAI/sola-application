'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface HandsfreeBlinkComponentProps {
  actionUrl: string;
  onActionTriggered?: (actionData: any) => void;
  autoExecute?: boolean;
}

export default function HandsfreeBlinkComponent({
  actionUrl,
  onActionTriggered,
  autoExecute = false,
}: HandsfreeBlinkComponentProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [actionData, setActionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBlinkAction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(actionUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      setActionData(data);
      if (autoExecute && data?.actions?.[0]) {
        await executeBlinkAction(data.actions[0].href);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch blink action');
      toast.error('Failed to load blink action');
    } finally {
      setLoading(false);
    };
  };

  const executeBlinkAction = async (endpoint: string, params?: Record<string, any>) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params || {}),
      });
      const result = await response.json();
      toast.success('Blink action executed handsfree!');
      if (onActionTriggered) {
        onActionTriggered(result);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute blink action');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (actionUrl) {
      fetchBlinkAction();
    }
  }, [actionUrl]);

  return (
    <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Handsfree Blink Action</h3>
        {loading && <span className="text-sm text-yellow-400 animate-pulse">Processing...</span>}
      </div>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      {actionData ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">{actionData.description || actionData.title}</p>
          <div className="flex flex-wrap gap-2">
            {actionData.actions?.map((act: any, idx: number) => (
              <button
                key={idx}
                onClick={() => executeBlinkAction(act.href)}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {act.label}
              
              </button>
            ))}
          </div>
        </div>
      ) : (
        !loading && <p className="text-sm text-gray-500">No action data available.</p>
      )}
    </div>
  );
}
