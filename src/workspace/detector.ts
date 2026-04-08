import path from 'node:path';

import { glob } from 'fast-glob';
import fs from 'fs-extra';

import type { WorkspacePackage } from '../registry/schema.js';

export type WorkspaceType = 'pnpm' | 'npm' | 'yarn' | 'none';

export interface WorkspaceInfo {
  type: WorkspaceType;
  root: string;
  packages: WorkspacePackage[];
}

export const detectWorkspace = async (cwd: string): Promise<WorkspaceInfo> => {
  const root = await findWorkspaceRoot(cwd);
  if (root === null) {
    return { packages: [], root: cwd, type: 'none' };
  }

  const type = await getWorkspaceType(root);
  const packages = await findWorkspacePackages(root, type);

  return { packages, root, type };
};

const findWorkspaceRoot = async (cwd: string): Promise<string | null> => {
  let current = cwd;
  while (current !== path.parse(current).root) {
    const isPnpm = await fs.pathExists(path.join(current, 'pnpm-workspace.yaml'));
    const isYarn = await fs.pathExists(path.join(current, 'yarn.lock'));
    const isNpm = await fs.pathExists(path.join(current, 'package-lock.json'));
    const isPnpmLock = await fs.pathExists(path.join(current, 'pnpm-lock.yaml'));

    if (isPnpm || isYarn || isNpm || isPnpmLock) {
      const pkgJsonPath = path.join(current, 'package.json');
      if (await fs.pathExists(pkgJsonPath)) {
        const pkgJson = (await fs.readJson(pkgJsonPath)) as { workspaces?: unknown };
        if (pkgJson.workspaces !== undefined) {
          return current;
        }
      }
      if (isPnpm) {
        return current;
      }
    }
    current = path.dirname(current);
  }
  return null;
};

const getWorkspaceType = async (root: string): Promise<WorkspaceType> => {
  if (await fs.pathExists(path.join(root, 'pnpm-workspace.yaml'))) {
    return 'pnpm';
  }
  if (await fs.pathExists(path.join(root, 'yarn.lock'))) {
    return 'yarn';
  }
  if (await fs.pathExists(path.join(root, 'package-lock.json'))) {
    return 'npm';
  }
  return 'none';
};

const findWorkspacePackages = async (
  root: string,
  type: WorkspaceType,
): Promise<WorkspacePackage[]> => {
  const patterns = await getWorkspacePatterns(root, type);
  if (patterns.length === 0) {
    return [];
  }

  const packagePaths = await glob(
    patterns.map((p) => path.join(p, 'package.json')),
    { absolute: true, cwd: root },
  );

  return resolvePackages(root, packagePaths);
};

const resolvePackages = async (
  root: string,
  packagePaths: string[],
): Promise<WorkspacePackage[]> => {
  const packages: WorkspacePackage[] = [];
  for (const pkgPath of packagePaths) {
    const pkgDir = path.dirname(pkgPath);
    const pkgJson = (await fs.readJson(pkgPath)) as { name: string };
    packages.push({
      hasConfig: await fs.pathExists(path.join(pkgDir, 'components.json')),
      name: pkgJson.name,
      path: pkgDir,
      relativePath: path.relative(root, pkgDir),
    });
  }
  return packages;
};

const getWorkspacePatterns = async (root: string, type: WorkspaceType): Promise<string[]> => {
  if (type === 'pnpm') {
    const yaml = await fs.readFile(path.join(root, 'pnpm-workspace.yaml'), 'utf8');
    const match = yaml.match(/packages:\s*\n((\s*-\s*['"]?.*['"]?\n?)+)/);
    if (match !== null && match[1] !== undefined) {
      return match[1]
        .split('\n')
        .map((line: string) => line.trim().replaceAll(/^-\s*['"]?|['"]?$/g, ''))
        .filter(Boolean);
    }
    return [];
  }

  const pkgJson = (await fs.readJson(path.join(root, 'package.json'))) as {
    workspaces?: string[] | { packages?: string[] };
  };
  if (Array.isArray(pkgJson.workspaces)) {
    return pkgJson.workspaces;
  }
  return pkgJson.workspaces?.packages ?? [];
};
