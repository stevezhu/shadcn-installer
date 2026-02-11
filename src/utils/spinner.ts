import ora, { type Ora } from "ora"

export function createSpinner(text: string, options: { silent?: boolean } = {}): Ora {
  const spinner = ora(text)
  if (options.silent) {
    // Mock spinner for silent mode
    return {
      start: () => spinner,
      stop: () => spinner,
      succeed: () => spinner,
      fail: () => spinner,
      text: "",
    } as any
  }
  return spinner
}
