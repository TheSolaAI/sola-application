'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  LuCheck,
  LuExternalLink,
  LuLoader,
  LuPlay,
  LuZap,
} from 'react-icons/lu';
import { VersionedTransaction } from '@solana/web3.js';
import { toast } from 'sonner';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { useWalletHandler } from '@/store/WalletHandler';
import {
  BlinkActionLink,
  BlinkActionParameter,
  BlinkActionToolData,
} from '@/types/blinks';
import {
  buildParameterizedActionUrl,
  initiateBlinkTransaction,
} from '@/tools/blinksToolSet/executeBlinkAction';

interface BlinksActionMessageItemProps {
  props: BlinkActionToolData;
}

interface ActionExecutionState {
  status: 'idle' | 'executing' | 'confirmed' | 'error';
  txSignature?: string;
  errorMessage?: string;
}

interface ParameterFormSectionProps {
  parameters: BlinkActionParameter[];
  values: Record<string, string | number>;
  onChange: (update: { name: string; value: string }) => void;
}

interface BlinkActionCardProps {
  actionItem: BlinkActionLink;
  disabled?: boolean;
  status: ActionExecutionState['status'];
  values: Record<string, string | number>;
  onParameterChange: (update: { name: string; value: string }) => void;
  onExecute: (href: string) => void;
}

// Renders parameter input fields when a Blink action requires user or AI-provided arguments.
const ParameterFormSection: FC<ParameterFormSectionProps> = ({
  parameters,
  values,
  onChange,
}) => {
  if (parameters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      {parameters.map((param) => (
        <div key={param.name} className="flex flex-col gap-1">
          <label className="text-xs text-secText">
            {param.label ?? param.name}
          </label>
          <input
            type={param.type === 'number' ? 'number' : 'text'}
            value={String(values[param.name] ?? '')}
            placeholder={param.label ?? param.name}
            onChange={(e) =>
              onChange({ name: param.name, value: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            className="bg-surface/40 border border-border rounded-lg px-3 py-1.5 text-sm text-textColor focus:outline-none focus:border-primary"
          />
        </div>
      ))}
    </div>
  );
};

const BlinkStatusIcon: FC<{ status: ActionExecutionState['status'] }> = ({
  status,
}) => {
  if (status === 'executing') {
    return <LuLoader className="animate-spin" size={14} />;
  }
  if (status === 'confirmed') {
    return <LuCheck size={14} />;
  }
  return <LuPlay size={14} />;
};

const BlinkActionItemCard: FC<BlinkActionCardProps> = ({
  actionItem,
  disabled,
  status,
  values,
  onParameterChange,
  onExecute,
}) => (
  <div className="bg-background rounded-lg p-3 border border-border flex flex-col gap-2">
    <ParameterFormSection
      parameters={actionItem.parameters ?? []}
      values={values}
      onChange={onParameterChange}
    />
    <button
      type="button"
      disabled={Boolean(disabled) || status === 'executing'}
      onClick={(e) => {
        e.stopPropagation();
        onExecute(actionItem.href);
      }}
      className="mt-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      <BlinkStatusIcon status={status} />
      <span>{actionItem.label}</span>
    </button>
  </div>
);

// Signs a base64-encoded Solana Action transaction with the active wallet and broadcasts it.
async function signAndBroadcastBlinkTransaction(
  transactionBase64: string
): Promise<string> {
  const activeWallet = useWalletHandler.getState().currentWallet;
  if (!activeWallet) {
    throw new Error('Connect a Solana wallet to execute this Blink action');
  }

  const txBuffer = Buffer.from(transactionBase64, 'base64');
  const versionedTx = VersionedTransaction.deserialize(txBuffer);
  const signedTx = await activeWallet.signTransaction(versionedTx);
  const serializedSigned = Buffer.from(signedTx.serialize()).toString('base64');

  const response = await fetch('/api/wallet/sendTransaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serializedTransaction: serializedSigned,
      options: { skipPreflight: true, maxRetries: 10 },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? 'Failed to broadcast Blink transaction');
  }

  return payload.txid ?? 'confirmed';
}

function resolveAvailableBlinkActions(
  data: BlinkActionToolData
): BlinkActionLink[] {
  const linkedActions = data.metadata.links?.actions;
  if (linkedActions && linkedActions.length > 0) {
    return linkedActions;
  }
  return [
    {
      label: data.metadata.label || 'Execute Action',
      href: data.selectedActionHref ?? data.actionUrl,
    },
  ];
}

function shouldAutoExecuteOnMount(
  data: BlinkActionToolData,
  alreadyTriggered: boolean
): boolean {
  if (alreadyTriggered || !data.autoExecute) {
    return false;
  }
  if (data.transactionHash) {
    return false;
  }
  return Boolean(data.selectedActionHref);
}

// Encapsulates custom Blink initiation and transaction execution state for handsfree and interactive flows.
function useBlinkActionExecutor(data: BlinkActionToolData) {
  const [paramValues, setParamValues] = useState<
    Record<string, string | number>
  >(data.parameters ?? {});
  const [executionState, setExecutionState] = useState<ActionExecutionState>({
    status: data.transactionHash ? 'confirmed' : 'idle',
  });
  const autoTriggeredRef = useRef(false);

  const handleParameterChange = useCallback(
    (update: { name: string; value: string }) => {
      setParamValues((prev) => ({ ...prev, [update.name]: update.value }));
    },
    []
  );

  const initiateAndExecuteAction = useCallback(
    async (actionTarget: {
      href: string;
      parameters?: Record<string, string | number>;
    }) => {
      const activeWallet = useWalletHandler.getState().currentWallet;
      if (!activeWallet?.address) {
        toast.error('No active Solana wallet connected');
        return;
      }

      const activeParameters = actionTarget.parameters ?? paramValues;
      setExecutionState({ status: 'executing' });
      try {
        const resolvedUrl = buildParameterizedActionUrl({
          baseActionUrl: data.actionUrl,
          href: actionTarget.href,
          parameters: activeParameters,
        });
        const txPayload = await initiateBlinkTransaction({
          actionUrl: resolvedUrl,
          account: activeWallet.address,
          parameters: activeParameters,
        });
        const signature = await signAndBroadcastBlinkTransaction(
          txPayload.transaction
        );
        setExecutionState({ status: 'confirmed', txSignature: signature });
        toast.success(txPayload.message ?? 'Blink action executed');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Blink execution failed';
        setExecutionState({ status: 'error', errorMessage: message });
        toast.error(message);
      }
    },
    [data.actionUrl, paramValues]
  );

  useEffect(() => {
    if (!shouldAutoExecuteOnMount(data, autoTriggeredRef.current)) {
      return;
    }
    autoTriggeredRef.current = true;
    void initiateAndExecuteAction({
      href: data.selectedActionHref as string,
      parameters: data.parameters,
    });
  }, [data, initiateAndExecuteAction]);

  return {
    paramValues,
    executionState,
    handleParameterChange,
    initiateAndExecuteAction,
  };
}

export const BlinksActionMessageItem: FC<BlinksActionMessageItemProps> = ({
  props,
}) => {
  const {
    paramValues,
    executionState,
    handleParameterChange,
    initiateAndExecuteAction,
  } = useBlinkActionExecutor(props);
  const actionsList = resolveAvailableBlinkActions(props);

  const compactContent = (
    <div className="flex items-center gap-2">
      <span className="text-textColor text-sm font-medium truncate">
        {props.metadata.title} —{' '}
        {props.selectedActionLabel ?? props.metadata.label}
      </span>
    </div>
  );

  const compactFooter = (
    <div className="flex items-center justify-between w-full">
      <a
        href={props.actionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 rounded-full hover:bg-surface/50 transition-colors"
        title="Inspect Blink Action"
        onClick={(e) => e.stopPropagation()}
      >
        <LuExternalLink className="text-secText" size={12} />
      </a>
      <span className="text-xs text-secText capitalize">
        {executionState.status}
      </span>
    </div>
  );

  const expandedContent = (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        {props.metadata.icon && (
          <img
            src={props.metadata.icon}
            alt={props.metadata.title}
            className="w-12 h-12 rounded-lg object-cover border border-border"
          />
        )}
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-textColor">
            {props.metadata.title}
          </h3>
          <p className="text-xs text-secText mt-1">
            {props.metadata.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {actionsList.map((actionItem) => (
          <BlinkActionItemCard
            key={`${actionItem.label}-${actionItem.href}`}
            actionItem={actionItem}
            disabled={props.metadata.disabled}
            status={executionState.status}
            values={paramValues}
            onParameterChange={handleParameterChange}
            onExecute={(href) =>
              void initiateAndExecuteAction({ href, parameters: paramValues })
            }
          />
        ))}
      </div>

      {executionState.errorMessage && (
        <p className="text-xs text-red-500">{executionState.errorMessage}</p>
      )}
    </div>
  );

  return (
    <BaseExpandableMessageItem
      title={props.metadata.title || 'Solana Blink Action'}
      icon={<LuZap className="text-primary" size={16} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
      maxWidth="max-w-lg"
    />
  );
};
