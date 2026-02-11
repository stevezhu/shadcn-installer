import { execa } from 'execa';

import { WorkspaceNotFoundError } from '../errors/index.js';
import { ManifestManager } from '../manifest/manager.js';
import { parseRegistryItem } from '../registry/parser.js';
import { resolveRegistryTree } from '../registry/resolver.js';
import { logger } from '../utils/logger.js';
import { addWorkspaceDependencies, getPackageInfo } from '../utils/package-json.js';
import { createSpinner } from '../utils/spinner.js';
import { getConfig } from '../workspace/config.js';
import { resolveWorkspaceDependencies } from '../workspace/dependency-resolver.js';
import { detectWorkspace } from '../workspace/detector.js';

import { updateConfig } from './config-updater.js';
import { writeComponentFiles } from './file-writer.js';

export interface InstallOptions {
  cwd: string;
  yes?: boolean;
  overwrite?: boolean;
  install?: boolean;
}

export async function installComponents(names: string[], options: InstallOptions) {
  const { cwd } = options;
  const spinner = createSpinner('Detecting workspace...').start();

  const workspace = await detectWorkspace(cwd);
  if (workspace.type === 'none') {
    spinner.fail();
    throw new WorkspaceNotFoundError();
  }

  const config = await getConfig(cwd);
  if (!config) {
    spinner.fail();
    throw new Error("Config not found. Please run 'shadcn init' first.");
  }

  const currentPkgInfo = await getPackageInfo(cwd);
  const currentPkgName = currentPkgInfo?.name;

  const manifestManager = new ManifestManager(workspace.root);
  spinner.text = 'Resolving components...';

  const resolvedTree = await resolveRegistryTree(names, config);
  const workspaceDeps = await resolveWorkspaceDependencies(
    resolvedTree,
    manifestManager,
    currentPkgName,
  );

  spinner.succeed('Components resolved.');

  for (const item of resolvedTree) {
    const itemSpinner = createSpinner(`Installing ${item.name}...`).start();

    await writeComponentFiles(item, config, workspaceDeps, {
      overwrite: options.overwrite,
    });

    await updateConfig(item, config);

    // Update manifest
    const parsed = parseRegistryItem(item.name);
    const firstRegistryKey = config.registries ? Object.keys(config.registries)[0] : undefined;
    const defaultRegistry = firstRegistryKey ?? '@shadcn';

    await manifestManager.addComponent(item.name, {
      installedAt: new Date().toISOString(),
      package: currentPkgName ?? 'unknown',
      path: cwd,
      registry: parsed.registry ?? defaultRegistry,
    });

    itemSpinner.succeed(`Installed ${item.name}.`);
  }

  if (workspaceDeps.length > 0) {
    const depSpinner = createSpinner('Updating workspace dependencies...').start();
    const deps: Record<string, string> = {};
    for (const dep of workspaceDeps) {
      deps[dep.package] = 'workspace:*';
    }
    await addWorkspaceDependencies(cwd, deps);
    depSpinner.succeed('Workspace dependencies updated.');
  }

  if (options.install !== false) {
    const installSpinner = createSpinner('Installing dependencies...').start();
    try {
      await execa('pnpm', ['install'], { cwd: workspace.root });
      installSpinner.succeed('Dependencies installed.');
    } catch {
      installSpinner.fail('Failed to install dependencies.');
    }
  }

  logger.success('\nInstallation complete!');
}
