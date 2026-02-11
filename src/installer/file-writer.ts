import path from 'node:path';

import fs from 'fs-extra';
import { Project } from 'ts-morph';

import type { Config, RegistryItem } from '../registry/schema.js';
import { logger } from '../utils/logger.js';
import type { WorkspaceDependency } from '../workspace/dependency-resolver.js';

export async function writeComponentFiles(
  item: RegistryItem,
  config: Config,
  workspaceDeps: WorkspaceDependency[],
  options: { overwrite?: boolean } = {},
) {
  if (!item.files) {return;}

  for (const file of item.files) {
    if (!file.content) {continue;}

    const targetPath = resolveTargetPath(file.path, item.type, config);
    const absolutePath = path.join(config.resolvedPaths.cwd, targetPath);

    if ((await fs.pathExists(absolutePath)) && !options.overwrite) {
      logger.warn(`Skipping ${targetPath} (already exists)`);
      continue;
    }

    let {content} = file;
    content = transformImports(content, workspaceDeps, config);

    await fs.ensureDir(path.dirname(absolutePath));
    await fs.writeFile(absolutePath, content);
  }
}

function resolveTargetPath(filePath: string, type: string, config: Config): string {
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
}

function transformImports(
  content: string,
  workspaceDeps: WorkspaceDependency[],
  _config: Config,
): string {
  const project = new Project({
    useInMemoryFileSystem: true,
  });
  const sourceFile = project.createSourceFile('temp.tsx', content);

  const importDeclarations = sourceFile.getImportDeclarations();

  for (const importDecl of importDeclarations) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    // Check if this import matches any of our workspace dependencies
    for (const dep of workspaceDeps) {
      // Very simple matching: if the import path contains the dependency name
      // and looks like an alias import.
      // E.g. "@/components/ui/button" matching dep.name === "button"
      if (
        (moduleSpecifier.startsWith('@/') || moduleSpecifier.startsWith('registry/')) &&
        moduleSpecifier.endsWith(dep.name)
      ) {
        // We need to determine the internal path.
        // For now, let's assume a standard structure.
        // In a real scenario, we might want to store more info in the manifest.
        let internalPath = '';
        if (moduleSpecifier.includes('/components/ui/')) {
          internalPath = 'components/ui/' + dep.name;
        } else if (moduleSpecifier.includes('/hooks/')) {
          internalPath = 'hooks/' + dep.name;
        } else if (moduleSpecifier.includes('/lib/')) {
          internalPath = 'lib/' + dep.name;
        } else {
          // Fallback to the same path but with @workspace prefix
          internalPath = moduleSpecifier.replace(/^(@\/|registry\/)/, '');
        }

        importDecl.setModuleSpecifier(`@workspace/${dep.package}/${internalPath}`);
      }
    }
  }

  const transformed = sourceFile.getFullText();
  return transformed;
}
