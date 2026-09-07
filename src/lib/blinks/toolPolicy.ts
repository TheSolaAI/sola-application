export function shouldAutoExecuteBlink(autoExecute?: boolean) {
  return autoExecute !== false;
}

export function blinkWalletError(
  autoExecute?: boolean,
  publicKey?: string
): string | undefined {
  if (shouldAutoExecuteBlink(autoExecute) && !publicKey) {
    return 'No wallet connected';
  }
  return undefined;
}
