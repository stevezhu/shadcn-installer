import type { ManifestManager } from '../manifest/manager.js';
import type { RegistryItem } from '../registry/schema.js';

export interface WorkspaceDependency {
  name: string;
  package: string;
  path: string;
}

export const resolveWorkspaceDependencies = async (
  items: RegistryItem[],
  manifestManager: ManifestManager,
  currentPackage: string,
): Promise<WorkspaceDependency[]> => {
  const dependencies: WorkspaceDependency[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    for (const depName of item.registryDependencies ?? []) {
      const location = await manifestManager.findComponent(depName);
      if (location !== null && location.package !== currentPackage && !seen.has(depName)) {
        dependencies.push({
          name: depName,
          package: location.package,
          path: location.path,
        });
        seen.add(depName);
      }
    }
  }

  return dependencies;
};
