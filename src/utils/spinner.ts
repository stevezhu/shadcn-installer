import ora from 'ora';
import type { Ora } from 'ora';

export function createSpinner(text: string, options: { silent?: boolean } = {}): Ora {
  const spinner = ora(text);
  if (options.silent) {
    // Mock spinner for silent mode
    return {
      fail: () => spinner,
      start: () => spinner,
      stop: () => spinner,
      succeed: () => spinner,
      text: '',
    } as any;
  }
  return spinner;
}
