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

export const installComponents = async (names: string[], options: InstallOptions) => {
  const { cwd } = options;
  const spinner = createSpinner('Detecting workspace...').start();

  const workspace = await detectWorkspace(cwd);
  if (workspace.type === 'none') {
    spinner.fail();
    throw new WorkspaceNotFoundError();
  }

  const config = await getConfig(cwd);
  if (config === null) {
    spinner.fail();
    throw new Error("Config not found. Please run 'shadcn init' first.");
  }

  const currentPkgInfo = (await getPackageInfo(cwd)) as { name?: string } | null;
  const currentPkgName = currentPkgInfo?.name;

  const manifestManager = new ManifestManager(workspace.root);
  spinner.text = 'Resolving components...';

  const resolvedTree: RegistryItem[] = await resolveRegistryTree(names, config);
  const workspaceDeps: WorkspaceDependency[] = await resolveWorkspaceDependencies(
    resolvedTree,
    manifestManager,
    currentPkgName ?? 'unknown',
  );

  spinner.succeed('Components resolved.');

  await performInstallation(
    resolvedTree,
    config,
    workspaceDeps,
    manifestManager,
    currentPkgName,
    options,
  );

  if (workspaceDeps.length > 0) {
    await updateWorkspaceDeps(cwd, workspaceDeps);
  }

  if (options.install !== false) {
    await runInstall(workspace.root);
  }

  logger.success('\nInstallation complete!');
};

const performInstallation = async (
  resolvedTree: RegistryItem[],
  config: Config,
  workspaceDeps: WorkspaceDependency[],
  manifestManager: ManifestManager,
  currentPkgName: string | undefined,
  options: InstallOptions,
) => {
  for (const item of resolvedTree) {
    const itemSpinner = createSpinner(`Installing ${item.name}...`).start();

    await writeComponentFiles(item, config, workspaceDeps, {
      overwrite: options.overwrite,
    });

    await updateConfig(item, config);

    const parsed = parseRegistryItem(item.name);
    const {registries} = config;
    const firstRegistryKey = registries ? Object.keys(registries)[0] : undefined;
    const defaultRegistry = firstRegistryKey ?? '@shadcn';

    await manifestManager.addComponent(item.name, {
      installedAt: new Date().toISOString(),
      package: currentPkgName ?? 'unknown',
      path: options.cwd,
      registry: parsed.registry ?? defaultRegistry,
    });

    itemSpinner.succeed(`Installed ${item.name}.`);
  }
};

const updateWorkspaceDeps = async (cwd: string, workspaceDeps: WorkspaceDependency[]) => {
  const depSpinner = createSpinner('Updating workspace dependencies...').start();
  const deps: Record<string, string> = {};
  for (const dep of workspaceDeps) {
    deps[dep.package] = 'workspace:*';
  }
  await addWorkspaceDependencies(cwd, deps);
  depSpinner.succeed('Workspace dependencies updated.');
};

const runInstall = async (root: string) => {
  const installSpinner = createSpinner('Installing dependencies...').start();
  try {
    await execa('pnpm', ['install'], { cwd: root });
    installSpinner.succeed('Dependencies installed.');
  } catch {
    installSpinner.fail('Failed to install dependencies.');
  }
};
