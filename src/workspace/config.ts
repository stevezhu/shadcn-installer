import path from 'node:path';

import fs from 'fs-extra';
import { Value } from 'typebox/value';

import { rawConfigSchema } from '../registry/schema.js';
import type { Config, RawConfig } from '../registry/schema.js';

export async function getConfig(cwd: string): Promise<Config | null> {
  const configPath = await findConfig(cwd);
  if (!configPath) {return null;}

  try {
    const rawConfig = await fs.readJson(configPath);
    if (!Value.Check(rawConfigSchema, rawConfig)) {
      return null;
    }

    return resolveConfigPaths(cwd, rawConfig);
  } catch {
    return null;
  }
}

async function findConfig(cwd: string): Promise<string | null> {
  const configPath = path.join(cwd, 'components.json');
  if (await fs.pathExists(configPath)) {return configPath;}

  let current = cwd;
  while (current !== path.parse(current).root) {
    const configPath = path.join(current, 'components.json');
    if (await fs.pathExists(configPath)) {return configPath;}
    current = path.dirname(current);
  }

  return null;
}

export function resolveConfigPaths(cwd: string, config: RawConfig): Config {
  return {
    ...config,
    resolvedPaths: {
      components: path.resolve(cwd, config.aliases.components),
      cwd,
      hooks: path.resolve(cwd, config.aliases.hooks ?? config.aliases.components),
      lib: path.resolve(cwd, config.aliases.lib ?? config.aliases.utils),
      tailwindConfig: path.resolve(cwd, config.tailwind.config ?? 'tailwind.config.js'),
      tailwindCss: path.resolve(cwd, config.tailwind.css),
      ui: path.resolve(cwd, config.aliases.ui ?? config.aliases.components),
      utils: path.resolve(cwd, config.aliases.utils),
    },
  };
}
