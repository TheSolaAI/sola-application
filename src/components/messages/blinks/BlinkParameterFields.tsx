'use client';

import { FC } from 'react';
import type { BlinkParameter } from '@/types/blink';
import { Input } from '@/components/common/Input';

interface BlinkParameterFieldsProps {
  parameters: BlinkParameter[];
  values: Record<string, string>;
  disabled?: boolean;
  onChange: (name: string, value: string) => void;
}

const optionSelected = (
  parameter: BlinkParameter,
  values: Record<string, string>,
  optionValue: string
) => {
  const current = values[parameter.name] ?? '';
  if (parameter.type === 'checkbox') {
    return current.split(',').includes(optionValue);
  }
  return current === optionValue;
};

export const BlinkParameterFields: FC<BlinkParameterFieldsProps> = ({
  parameters,
  values,
  disabled,
  onChange,
}) => {
  if (!parameters.length) return null;

  return (
    <div className="space-y-3">
      {parameters.map((parameter) => {
        if (
          parameter.options &&
          (parameter.type === 'select' ||
            parameter.type === 'radio' ||
            parameter.type === 'checkbox' ||
            !parameter.type)
        ) {
          return (
            <div key={parameter.name} className="space-y-2">
              {parameter.label && (
                <p className="text-xs text-secText">{parameter.label}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {parameter.options.map((option) => {
                  const selected = optionSelected(
                    parameter,
                    values,
                    option.value
                  );
                  return (
                    <button
                      key={`${parameter.name}-${option.value}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (parameter.type === 'checkbox') {
                          const current = (values[parameter.name] ?? '')
                            .split(',')
                            .filter(Boolean);
                          const next = selected
                            ? current.filter((value) => value !== option.value)
                            : [...current, option.value];
                          onChange(parameter.name, next.join(','));
                          return;
                        }
                        onChange(parameter.name, option.value);
                      }}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        selected
                          ? 'bg-primary text-black'
                          : 'bg-background text-textColor border border-border hover:bg-surface'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        if (parameter.type === 'textarea') {
          return (
            <div key={parameter.name} className="space-y-1">
              {parameter.label && (
                <p className="text-xs text-secText">{parameter.label}</p>
              )}
              <textarea
                value={values[parameter.name] ?? ''}
                disabled={disabled}
                onChange={(event) =>
                  onChange(parameter.name, event.target.value)
                }
                placeholder={parameter.label || parameter.name}
                className="w-full min-h-20 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-textColor placeholder:text-secText focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          );
        }

        return (
          <div key={parameter.name} className="space-y-1">
            {parameter.label && (
              <p className="text-xs text-secText">{parameter.label}</p>
            )}
            <Input
              type={
                parameter.type === 'number'
                  ? 'number'
                  : parameter.type || 'text'
              }
              value={values[parameter.name] ?? ''}
              disabled={disabled}
              min={parameter.min as number | undefined}
              max={parameter.max as number | undefined}
              placeholder={parameter.label || parameter.name}
              onChange={(event) => onChange(parameter.name, event.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
};
