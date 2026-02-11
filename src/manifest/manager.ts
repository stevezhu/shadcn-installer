import path from 'node:path';

import fs from 'fs-extra';
import { Value } from 'typebox/value';

import { manifestSchema } from '../registry/schema.js';
import type { Manifest, RegistryManifestEntry } from '../registry/schema.js';

const MANIFEST_FILE = '.shadcn-manifest.json';

export class ManifestManager {
  private manifestPath: string;

  constructor(workspaceRoot: string) {
    this.manifestPath = path.join(workspaceRoot, MANIFEST_FILE);
  }

  async load(): Promise<Manifest> {
    if (!(await fs.pathExists(this.manifestPath))) {
      return { components: {} };
    }

    try {
      const data = await fs.readJson(this.manifestPath);
      if (Value.Check(manifestSchema, data)) {
        return data;
      }
      return { components: {} };
    } catch {
      return { components: {} };
    }
  }

  async save(manifest: Manifest): Promise<void> {
    await fs.writeJson(this.manifestPath, manifest, { spaces: 2 });
  }

  async addComponent(name: string, entry: RegistryManifestEntry): Promise<void> {
    const manifest = await this.load();
    manifest.components[name] = entry;
    await this.save(manifest);
  }

  async findComponent(name: string): Promise<RegistryManifestEntry | null> {
    const manifest = await this.load();
    return manifest.components[name] ?? null;
  }

  async listComponents(): Promise<Record<string, RegistryManifestEntry>> {
    const manifest = await this.load();
    return manifest.components;
  }
}
