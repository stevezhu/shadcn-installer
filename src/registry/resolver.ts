import type { Config, RegistryItem } from "./schema.js"
import { parseRegistryItem } from "./parser.js"
import { fetchRegistryItem } from "./fetcher.js"
import { RegistryNotConfiguredError, CircularDependencyError } from "../errors/index.js"

const BUILTIN_REGISTRIES: Record<string, string> = {
  "@shadcn": "https://ui.shadcn.com/r/{name}.json",
}

export async function resolveRegistryTree(
  names: string[],
  config: Config
): Promise<RegistryItem[]> {
  const registryItems: RegistryItem[] = []
  const visited = new Set<string>()
  const stack = new Set<string>()

  async function resolve(name: string) {
    if (visited.has(name)) return
    if (stack.has(name)) {
      throw new CircularDependencyError([...stack, name])
    }

    stack.add(name)
    const item = await fetchItem(name, config)
    registryItems.push(item)

    if (item.registryDependencies) {
      for (const dep of item.registryDependencies) {
        await resolve(dep)
      }
    }

    stack.delete(name)
    visited.add(name)
  }

  for (const name of names) {
    await resolve(name)
  }

  return registryItems
}

async function fetchItem(name: string, config: Config): Promise<RegistryItem> {
  const { registry, item } = parseRegistryItem(name)
  const registries = { ...BUILTIN_REGISTRIES, ...config.registries }
  const registryConfig = registries[registry === "default" ? "@shadcn" : registry]

  if (!registryConfig) {
    throw new RegistryNotConfiguredError(registry)
  }

  const baseUrl = typeof registryConfig === "string" ? registryConfig : registryConfig.url
  const url = baseUrl
    .replace("{name}", item)
    .replace("{style}", config.style)

  return await fetchRegistryItem(url)
}
