export class ShadcnError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ShadcnError"
  }
}

export class WorkspaceNotFoundError extends ShadcnError {
  constructor() {
    super("Workspace root not found. Please run this command within a monorepo.")
  }
}

export class ComponentNotFoundError extends ShadcnError {
  constructor(name: string) {
    super(`Component "${name}" not found in registry.`)
  }
}

export class ManifestCorruptedError extends ShadcnError {
  constructor() {
    super("The .shadcn-manifest.json file is corrupted.")
  }
}

export class RegistryNotConfiguredError extends ShadcnError {
  constructor(name: string) {
    super(`Registry "${name}" is not configured in components.json.`)
  }
}

export class CircularDependencyError extends ShadcnError {
  constructor(stack: string[]) {
    super(`Circular dependency detected: ${stack.join(" -> ")}`)
  }
}
