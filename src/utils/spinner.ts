import ora from 'ora';
import type { Ora } from 'ora';

export const createSpinner = (text: string, options: { silent?: boolean } = {}): Ora => {
  const spinner = ora(text);
  if (options.silent === true) {
    // Mock spinner for silent mode
    return {
      fail: () => spinner,
      start: () => spinner,
      stop: () => spinner,
      succeed: () => spinner,
      text: '',
    } as unknown as Ora;
  }
  return spinner;
};
