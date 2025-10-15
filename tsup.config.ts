import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/commands/*.ts'],
  format: ['esm'],
  clean: true,
  target: 'node20',
});
