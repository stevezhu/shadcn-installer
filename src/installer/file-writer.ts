import path from 'node:path';

import fs from 'fs-extra';
import { Project } from 'ts-morph';
import type { ImportDeclaration } from 'ts-morph';

import type { Config, RegistryItem } from '../registry/schema.js';
import { logger } from '../utils/logger.js';
import type { WorkspaceDependency } from '../workspace/dependency-resolver.js';

export const writeComponentFiles = async (
  item: RegistryItem,

  config: Config,

  workspaceDeps: WorkspaceDependency[],

  options: { overwrite?: boolean } = {},
) => {
  for (const file of item.files ?? []) {
    await processFile(file, item.type, config, workspaceDeps, options);
  }
};

const processFile = async (
  file: { path: string; content?: string },

  itemType: string,

  config: Config,

  workspaceDeps: WorkspaceDependency[],

  options: { overwrite?: boolean },
) => {
  if (file.content === undefined || file.content === null || file.content === '') {
    return;
  }

  const targetPath = resolveTargetPath(file.path, itemType, config);

  const absolutePath = path.join(config.resolvedPaths.cwd, targetPath);

  if ((await fs.pathExists(absolutePath)) && options.overwrite !== true) {
    logger.warn(`Skipping ${targetPath} (already exists)`);

    return;
  }

  const content = transformImports(file.content, workspaceDeps, config);

  await fs.ensureDir(path.dirname(absolutePath));

  await fs.writeFile(absolutePath, content);
};

const resolveTargetPath = (filePath: string, type: string, config: Config): string => {
  let baseDir: string;
  if (type === 'registry:ui') {
    baseDir = config.resolvedPaths.ui;
  } else if (type === 'registry:hook') {
    baseDir = config.resolvedPaths.hooks;
  } else if (type === 'registry:lib') {
    baseDir = config.resolvedPaths.lib;
  } else {
    baseDir = config.resolvedPaths.components;
  }

  const absoluteTarget = path.join(baseDir, filePath);
  return path.relative(config.resolvedPaths.cwd, absoluteTarget);
};

const transformImports = (
  content: string,
  workspaceDeps: WorkspaceDependency[],
  _config: Config,
): string => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.tsx', content);

  for (const importDecl of sourceFile.getImportDeclarations()) {
    updateImportSpecifier(importDecl, workspaceDeps);
  }

  return sourceFile.getFullText();
};

const updateImportSpecifier = (
  importDecl: ImportDeclaration,
  workspaceDeps: WorkspaceDependency[],
) => {
  const moduleSpecifier = importDecl.getModuleSpecifierValue();

  for (const dep of workspaceDeps) {
    if (
      (moduleSpecifier.startsWith('@/') || moduleSpecifier.startsWith('registry/')) &&
      moduleSpecifier.endsWith(dep.name)
    ) {
      const internalPath = resolveInternalPath(moduleSpecifier, dep.name);
      importDecl.setModuleSpecifier(`@workspace/${dep.package}/${internalPath}`);
    }
  }
};

const resolveInternalPath = (moduleSpecifier: string, depName: string): string => {
  if (moduleSpecifier.includes('/components/ui/')) {
    return `components/ui/${depName}`;
  }
  if (moduleSpecifier.includes('/hooks/')) {
    return `hooks/${depName}`;
  }
  if (moduleSpecifier.includes('/lib/')) {
    return `lib/${depName}`;
  }
  return moduleSpecifier.replace(/^(@\/|registry\/)/, '');
};
