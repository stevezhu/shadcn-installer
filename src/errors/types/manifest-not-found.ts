import { ShadcnError } from './base.js';
export class ManifestNotFoundError extends ShadcnError {
  constructor(path: string) {
    super(`Manifest not found at ${path}.`);
  }
}
