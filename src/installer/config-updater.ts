import deepmerge from 'deepmerge';
import fs from 'fs-extra';

import type { Config, RegistryItem } from '../registry/schema.js';
import { logger } from '../utils/logger.js';

export async function updateConfig(item: RegistryItem, config: Config) {
  if (item.tailwind) {
    await updateTailwindConfig(item.tailwind, config);
  }
  if (item.cssVars) {
    await updateCssVars(item.cssVars, config);
  }
}

async function updateTailwindConfig(tailwind: any, config: Config) {
  const tailwindConfigPath = config.resolvedPaths.tailwindConfig;
  if (!(await fs.pathExists(tailwindConfigPath))) {
    return;
  }

  logger.info(`Merging Tailwind config for ${tailwindConfigPath}`);

  try {
    // Assuming tailwind config is JSON for simplicity as per instructions,
    // though in reality it's often JS/TS.
    const current = await fs.readJson(tailwindConfigPath);
    const merged = deepmerge(current, tailwind, {
      arrayMerge: (_tgt, src) => src,
    });

    await fs.writeJson(tailwindConfigPath, merged, { spaces: 2 });
  } catch {
    logger.warn(
      `Could not update Tailwind config: ${tailwindConfigPath}. It might not be a valid JSON file.`,
    );
  }
}

async function updateCssVars(cssVars: any, config: Config) {
  const cssPath = config.resolvedPaths.tailwindCss;
  if (!(await fs.pathExists(cssPath))) {
    return;
  }

  logger.info(`Updating CSS variables in ${cssPath}`);

  try {
    let content = await fs.readFile(cssPath, 'utf8');

    // Create backup
    await fs.writeFile(`${cssPath}.bak`, content);

    // Simple implementation to append/update CSS variables
    // In a real scenario, we'd use a CSS parser (postcss)
    let cssString = '\n@layer base {\n  :root {\n';
    if (cssVars.light) {
      for (const [key, value] of Object.entries(cssVars.light)) {
        cssString += `    ${key}: ${value};\n`;
      }
    }
    cssString += '  }\n';

    if (cssVars.dark) {
      cssString += '\n  .dark {\n';
      for (const [key, value] of Object.entries(cssVars.dark)) {
        cssString += `    ${key}: ${value};\n`;
      }
      cssString += '  }\n';
    }
    cssString += '}\n';

    // Check if we already have a base layer block
    if (content.includes('@layer base')) {
      // Very crude way to append to existing layer base
      content = content.replace('@layer base {', `@layer base {\n${cssString}`);
    } else {
      content += cssString;
    }

    await fs.writeFile(cssPath, content);
  } catch {
    logger.error(`Failed to update CSS variables in ${cssPath}`);
  }
}
