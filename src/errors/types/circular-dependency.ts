import { ShadcnError } from './base.js';
export class CircularDependencyError extends ShadcnError {
  constructor(stack: string[]) {
    super(`Circular dependency detected: ${stack.join(' -> ')}`);
  }
}
