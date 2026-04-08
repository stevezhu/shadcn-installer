import { ShadcnError } from './base.js';
export class RegistryNotConfiguredError extends ShadcnError {
  constructor(registry: string) {
    super(`Registry "${registry}" not configured in components.json.`);
  }
}
