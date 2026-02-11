import path from "node:path"
import fs from "fs-extra"
import { glob } from "fast-glob"
import type { WorkspacePackage } from "../registry/schema.js"

export type WorkspaceType = "pnpm" | "npm" | "yarn" | "none"

export interface WorkspaceInfo {
  type: WorkspaceType
  root: string
  packages: WorkspacePackage[]
}

export async function detectWorkspace(cwd: string): Promise<WorkspaceInfo> {
  const root = await findWorkspaceRoot(cwd)
  if (!root) {
    return { type: "none", root: cwd, packages: [] }
  }

  const type = await getWorkspaceType(root)
  const packages = await findWorkspacePackages(root, type)

  return { type, root, packages }
}

async function findWorkspaceRoot(cwd: string): Promise<string | null> {
  let current = cwd
  while (current !== path.parse(current).root) {
    if (
      (await fs.pathExists(path.join(current, "pnpm-workspace.yaml"))) ||
      (await fs.pathExists(path.join(current, "pnpm-lock.yaml"))) ||
      (await fs.pathExists(path.join(current, "yarn.lock"))) ||
      (await fs.pathExists(path.join(current, "package-lock.json")))
    ) {
      // Check if it's a workspace root by looking for workspace config
      const pkgJsonPath = path.join(current, "package.json")
      if (await fs.pathExists(pkgJsonPath)) {
        const pkgJson = await fs.readJson(pkgJsonPath)
        if (pkgJson.workspaces) return current
      }
      if (await fs.pathExists(path.join(current, "pnpm-workspace.yaml"))) {
        return current
      }
    }
    current = path.dirname(current)
  }
  return null
}

async function getWorkspaceType(root: string): Promise<WorkspaceType> {
  if (await fs.pathExists(path.join(root, "pnpm-workspace.yaml"))) return "pnpm"
  if (await fs.pathExists(path.join(root, "yarn.lock"))) return "yarn"
  if (await fs.pathExists(path.join(root, "package-lock.json"))) return "npm"
  return "none"
}

async function findWorkspacePackages(
  root: string,
  type: WorkspaceType
): Promise<WorkspacePackage[]> {
  let patterns: string[] = []

  if (type === "pnpm") {
    const yaml = await fs.readFile(path.join(root, "pnpm-workspace.yaml"), "utf8")
    const match = yaml.match(/packages:\s*\n((\s*-\s*['"]?.*['"]?\n?)+)/)
    if (match) {
      patterns = match[1]
        .split("\n")
        .map((line) => line.trim().replace(/^-\s*['"]?|['"]?$/g, ""))
        .filter(Boolean)
    }
  } else {
    const pkgJson = await fs.readJson(path.join(root, "package.json"))
    if (Array.isArray(pkgJson.workspaces)) {
      patterns = pkgJson.workspaces
    } else if (pkgJson.workspaces?.packages) {
      patterns = pkgJson.workspaces.packages
    }
  }

  if (patterns.length === 0) return []

  const packagePaths = await glob(
    patterns.map((p) => path.join(p, "package.json")),
    { cwd: root, absolute: true }
  )

  const packages: WorkspacePackage[] = []
  for (const pkgPath of packagePaths) {
    const pkgDir = path.dirname(pkgPath)
    const pkgJson = await fs.readJson(pkgPath)
    packages.push({
      name: pkgJson.name,
      path: pkgDir,
      relativePath: path.relative(root, pkgDir),
      hasConfig: await fs.pathExists(path.join(pkgDir, "components.json")),
    })
  }

  return packages
}
