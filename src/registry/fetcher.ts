import { Value } from 'typebox/value';

import { ComponentNotFoundError } from '../errors/index.js';

import { registryItemSchema } from './schema.js';
import type { RegistryItem } from './schema.js';

const registryCache = new Map<string, Promise<any>>();

export async function fetchRegistryItem(url: string): Promise<RegistryItem> {
  if (registryCache.has(url)) {
    return registryCache.get(url)!;
  }

  const fetchPromise = (async () => {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new ComponentNotFoundError(url);
      }
      throw new Error(`Failed to fetch registry item from ${url}: ${response.statusText}`);
    }

    const json = await response.json();
    if (!Value.Check(registryItemSchema, json)) {
      throw new Error(`Invalid registry item from ${url}`);
    }

    return json;
  })();

  registryCache.set(url, fetchPromise);
  return fetchPromise;
}
