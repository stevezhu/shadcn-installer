import { RegistryNotConfiguredError, CircularDependencyError } from '../errors/index.js';

import { fetchRegistryItem } from './fetcher.js';
import { parseRegistryItem } from './parser.js';
import type { Config, RegistryItem } from './schema.js';

const BUILTIN_REGISTRIES: Record<string, string> = {
  '@shadcn': 'https://ui.shadcn.com/r/{name}.json',
};

export const resolveRegistryTree = async (
  names: string[],
  config: Config,
): Promise<RegistryItem[]> => {
  const registryItems: RegistryItem[] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  const resolve = async (name: string) => {
    if (visited.has(name)) {
      return;
    }
    if (stack.has(name)) {
      throw new CircularDependencyError([...stack, name]);
    }

    stack.add(name);
    const item = await fetchItem(name, config);
    registryItems.push(item);

    for (const dep of item.registryDependencies ?? []) {
      await resolve(dep);
    }

    stack.delete(name);
    visited.add(name);
  };

  for (const name of names) {
    await resolve(name);
  }

  return registryItems;
};

const fetchItem =  async (name: string, config: Config): Promise<RegistryItem> => {
  const { registry, item } = parseRegistryItem(name);
  const registries = { ...BUILTIN_REGISTRIES, ...config.registries };
  const registryKey: string =
    registry === 'default' || registry === null || registry === undefined ? '@shadcn' : registry;
  const registryConfig = registries[registryKey as keyof typeof registries];

  if (registryConfig === undefined) {
    throw new RegistryNotConfiguredError(registry ?? 'unknown');
  }

  const baseUrl = typeof registryConfig === 'string' ? registryConfig : registryConfig.url;
  const url = baseUrl.replace('{name}', item).replace('{style}', config.style);

  return fetchRegistryItem(url);
};
