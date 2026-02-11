import { ShadcnError } from './base.js';
export class ComponentNotFoundError extends ShadcnError {
  constructor(component: string) {
    super(`Component "${component}" not found in registry.`);
  }
}
