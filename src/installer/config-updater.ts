import deepmerge from 'deepmerge';
import fs from 'fs-extra';

import type { Config, RegistryItem } from '../registry/schema.js';
import { logger } from '../utils/logger.js';

export const updateConfig = async (item: RegistryItem, config: Config) => {
  if (item.tailwind !== undefined) {
    await updateTailwindConfig(item.tailwind, config);
  }
  if (item.cssVars !== undefined) {
    await updateCssVars(item.cssVars, config);
  }
};

const updateTailwindConfig = async (tailwind: unknown, config: Config) => {
  const tailwindConfigPath = config.resolvedPaths.tailwindConfig;
  if (!(await fs.pathExists(tailwindConfigPath))) {
    return;
  }

  logger.info(`Merging Tailwind config for ${tailwindConfigPath}`);

  try {
    const current = (await fs.readJson(tailwindConfigPath)) as object;
    const merged = deepmerge(current, tailwind as object, {
      arrayMerge: (_tgt, src: unknown[]) => src,
    });

    await fs.writeJson(tailwindConfigPath, merged, { spaces: 2 });
  } catch {
    logger.warn(
      `Could not update Tailwind config: ${tailwindConfigPath}. It might not be a valid JSON file.`,
    );
  }
};

const updateCssVars = async (cssVars: unknown, config: Config) => {
  const cssPath = config.resolvedPaths.tailwindCss;
  if (!(await fs.pathExists(cssPath))) {
    return;
  }

  logger.info(`Updating CSS variables in ${cssPath}`);

  try {
    const content = await fs.readFile(cssPath, 'utf8');
    await fs.writeFile(`${cssPath}.bak`, content);

    const cssString = generateCssString(
      cssVars as {
        light?: Record<string, string>;
        dark?: Record<string, string>;
      },
    );

    const newContent = content.includes('@layer base')
      ? content.replace('@layer base {', `@layer base {\n${cssString}`)
      : `${content}${cssString}`;

    await fs.writeFile(cssPath, newContent);
  } catch {
    logger.error(`Failed to update CSS variables in ${cssPath}`);
  }
};

const generateCssString = (cssVars: {
  light?: Record<string, string>;
  dark?: Record<string, string>;
}) => {
  let cssString = '\n@layer base {\n  :root {\n';
  for (const [key, value] of Object.entries(cssVars.light ?? {})) {
    cssString += `    ${key}: ${value};\n`;
  }
  cssString += '  }\n';

  if (cssVars.dark !== undefined) {
    cssString += '\n  .dark {\n';
    for (const [key, value] of Object.entries(cssVars.dark)) {
      cssString += `    ${key}: ${value};\n`;
    }
    cssString += '  }\n';
  }
  return `${cssString}}\n`;
};
