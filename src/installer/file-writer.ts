import path from "node:path"
import fs from "fs-extra"
import type { Config, RegistryItem } from "../registry/schema.js"
import type { WorkspaceDependency } from "../workspace/dependency-resolver.js"
import { logger } from "../utils/logger.js"

export async function writeComponentFiles(
  item: RegistryItem,
  config: Config,
  workspaceDeps: WorkspaceDependency[],
  options: { overwrite?: boolean } = {}
) {
  if (!item.files) return

  for (const file of item.files) {
    if (!file.content) continue

    const targetPath = resolveTargetPath(file.path, item.type, config)
    const absolutePath = path.join(config.resolvedPaths.cwd, targetPath)

    if (await fs.pathExists(absolutePath) && !options.overwrite) {
      logger.warn(`Skipping ${targetPath} (already exists)`)
      continue
    }

    let content = file.content
    content = transformImports(content, workspaceDeps, config)

    await fs.ensureDir(path.dirname(absolutePath))
    await fs.writeFile(absolutePath, content)
  }
}

function resolveTargetPath(filePath: string, type: string, config: Config): string {
  // Simplification: use aliases to determine base directory
  if (type === "registry:ui") {
    return path.join(config.aliases.ui || config.aliases.components, filePath)
  }
  if (type === "registry:hook") {
    return path.join(config.aliases.hooks || config.aliases.components, filePath)
  }
  if (type === "registry:lib") {
    return path.join(config.aliases.lib || config.aliases.utils, filePath)
  }
  return path.join(config.aliases.components, filePath)
}

function transformImports(
  content: string,
  workspaceDeps: WorkspaceDependency[],
  config: Config
): string {
  let transformed = content

  // Replace registry dependency imports with workspace package imports
  // This is a simplified regex-based approach. For production, use ts-morph.
  for (const dep of workspaceDeps) {
    // Example: import { Button } from "@/components/ui/button"
    // To: import { Button } from "@workspace/ui/button"
    // This depends on how components are exported in the destination package.
    // For now, let's assume standard shadcn-like structure.
  }

  return transformed
}
