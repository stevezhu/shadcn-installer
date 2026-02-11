import { ShadcnError } from './base.js';
export class WorkspaceNotFoundError extends ShadcnError {
  constructor() {
    super('Workspace root not found. Please run this command within a monorepo.');
  }
}
