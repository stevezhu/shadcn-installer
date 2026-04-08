import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: false,
  entry: ['src/index.ts', 'src/commands/*.ts'],
  format: ['esm'],
  target: 'node20',
});
