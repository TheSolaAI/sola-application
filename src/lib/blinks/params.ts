import type { BlinkLinkedAction, BlinkParameter } from '../../types/blink';

const templateNames = (value: string) =>
  [...value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]);

export type BlinkParamValue = string | string[];
export type BlinkParamMap = Record<string, BlinkParamValue>;

export function collectDefaultParams(
  action?: BlinkLinkedAction
): Record<string, string> {
  const defaults: Record<string, string> = {};
  if (!action?.parameters) return defaults;

  for (const parameter of action.parameters) {
    const selected = parameter.options?.filter((option) => option.selected);
    if (!selected?.length) continue;

    if (parameter.type === 'checkbox') {
      defaults[parameter.name] = selected
        .map((option) => option.value)
        .join(',');
    } else {
      defaults[parameter.name] = selected[0].value;
    }
  }

  return defaults;
}

export function mergeBlinkParams(
  action: BlinkLinkedAction | undefined,
  provided?: Record<string, string>
): Record<string, string> {
  return {
    ...collectDefaultParams(action),
    ...(provided ?? {}),
  };
}

export function missingRequiredParams(
  action: BlinkLinkedAction | undefined,
  params: Record<string, string>
): string[] {
  if (!action?.parameters) return [];

  return action.parameters
    .filter((parameter) => parameter.required)
    .filter((parameter) => !hasParamValue(params[parameter.name], parameter))
    .map((parameter) => parameter.name);
}

export function canExecuteAction(
  action: BlinkLinkedAction | undefined,
  params: Record<string, string>
): boolean {
  if (!action?.href) return false;
  const stillMissing = templateNames(action.href).filter(
    (name) => !hasParamValue(params[name])
  );
  if (stillMissing.length) return false;
  return missingRequiredParams(action, params).length === 0;
}

export interface AppliedActionParams {
  href: string;
  data: Record<string, BlinkParamValue>;
}

export function applyActionParams(
  actionUrl: string,
  href: string,
  params: Record<string, string> = {}
): AppliedActionParams {
  if (!href) {
    throw new Error('Blink action is missing a URL');
  }

  const used = new Set<string>();
  const substituted = href.replace(
    /\{([a-zA-Z0-9_]+)\}/g,
    (_match, name: string) => {
      const value = params[name];
      if (value == null || value === '') {
        return `{${name}}`;
      }
      used.add(name);
      return encodeURIComponent(value);
    }
  );

  const leftover = templateNames(substituted);
  if (leftover.length) {
    throw new Error(
      `Missing Blink parameter${leftover.length > 1 ? 's' : ''}: ${leftover.join(', ')}`
    );
  }

  const resolved = new URL(substituted, actionUrl);
  const data: Record<string, BlinkParamValue> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!used.has(key) && value !== '') {
      data[key] = value.includes(',') ? value.split(',') : value;
    }
  }

  return {
    href: resolved.toString(),
    data,
  };
}

const hasParamValue = (value?: string, parameter?: BlinkParameter) => {
  if (value == null) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (parameter?.pattern) {
    try {
      return new RegExp(parameter.pattern).test(trimmed);
    } catch {
      return true;
    }
  }
  return true;
};
