'use client';

import { useState } from 'react';
import { useChat } from '@/providers/ChatContextProvider';
import type { BlinkData } from '@/tools/blinksToolSet/actions';

export function BlinkMessageItem({ props }: { props: BlinkData }) {
  const { processMessage, isLoading } = useChat();
  const [values, setValues] = useState<Record<number, Record<string, string>>>(
    {}
  );

  // Buttons and voice requests both enter the same client-side tool handlers.
  async function initiateAction(actionIndex: number) {
    await processMessage(
      `Execute Blink ${props.actionName}, action ${actionIndex} (${props.actions[actionIndex].label}) with parameters ${JSON.stringify(values[actionIndex] ?? {})}.`
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4 text-textColor">
      <p className="text-sm text-secText">{new URL(props.url).hostname}</p>
      <h3 className="font-semibold">{props.title}</h3>
      <p>{props.description}</p>
      {props.error && <p role="alert">{props.error.message}</p>}
      <p className="text-sm text-secText">
        Tell Sola which action to take, or choose below.
      </p>
      {props.actions.map((action, index) => (
        <form
          key={index}
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void initiateAction(index);
          }}
        >
          {(action.parameters ?? []).map((parameter) => (
            <label key={parameter.name}>
              {parameter.label ?? parameter.name}
              <input
                className="block rounded border border-border bg-background p-2"
                required={parameter.required}
                value={values[index]?.[parameter.name] ?? ''}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    [index]: {
                      ...previous[index],
                      [parameter.name]: event.target.value,
                    },
                  }))
                }
              />
            </label>
          ))}
          <button
            type="submit"
            className="rounded bg-primary px-3 py-2 disabled:opacity-50"
            disabled={
              isLoading ||
              props.disabled ||
              !!props.error ||
              (!!action.type && action.type !== 'transaction')
            }
          >
            {action.label}
          </button>
        </form>
      ))}
    </section>
  );
}
