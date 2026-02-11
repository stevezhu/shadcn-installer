import type { RegistryItem } from "../registry/schema.js"
import type { ManifestManager } from "../manifest/manager.js"

export interface WorkspaceDependency {
  name: string
  package: string
  path: string
}

export async function resolveWorkspaceDependencies(
  items: RegistryItem[],
  manifestManager: ManifestManager,
  currentPackage: string
): Promise<WorkspaceDependency[]> {
  const dependencies: WorkspaceDependency[] = []
  const seen = new Set<string>()

  for (const item of items) {
    if (item.registryDependencies) {
      for (const depName of item.registryDependencies) {
        const location = await manifestManager.findComponent(depName)
        if (location && location.package !== currentPackage) {
          if (!seen.has(depName)) {
            dependencies.push({
              name: depName,
              package: location.package,
              path: location.path,
            })
            seen.add(depName)
          }
        }
      }
    }
  }

  return dependencies
}
