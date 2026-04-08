import { Type } from 'typebox';
import type { Static } from 'typebox';

export const registryConfigItemSchema = Type.Union([
  Type.String(),
  Type.Object({
    headers: Type.Optional(Type.Record(Type.String(), Type.String())),
    params: Type.Optional(Type.Record(Type.String(), Type.String())),
    url: Type.String(),
  }),
]);

export const registryConfigSchema = Type.Record(
  // Should start with @
  Type.String(),
  registryConfigItemSchema,
);

export const rawConfigSchema = Type.Object({
  $schema: Type.Optional(Type.String()),
  aliases: Type.Object({
    components: Type.String(),
    hooks: Type.Optional(Type.String()),
    lib: Type.Optional(Type.String()),
    ui: Type.Optional(Type.String()),
    utils: Type.String(),
  }),
  iconLibrary: Type.Optional(Type.String()),
  menuAccent: Type.Optional(
    Type.Union([Type.Literal('subtle'), Type.Literal('bold')], {
      default: 'subtle',
    }),
  ),
  menuColor: Type.Optional(
    Type.Union([Type.Literal('default'), Type.Literal('inverted')], {
      default: 'default',
    }),
  ),
  registries: Type.Optional(registryConfigSchema),
  rsc: Type.Optional(Type.Boolean({ default: false })),
  rtl: Type.Optional(Type.Boolean({ default: false })),
  style: Type.String(),
  tailwind: Type.Object({
    baseColor: Type.String(),
    config: Type.Optional(Type.String()),
    css: Type.String(),
    cssVariables: Type.Optional(Type.Boolean({ default: true })),
    prefix: Type.Optional(Type.String()),
  }),
  tsx: Type.Optional(Type.Boolean({ default: true })),
});

export type RawConfig = Static<typeof rawConfigSchema>;

export const configSchema = Type.Intersect([
  rawConfigSchema,
  Type.Object({
    resolvedPaths: Type.Object({
      components: Type.String(),
      cwd: Type.String(),
      hooks: Type.String(),
      lib: Type.String(),
      tailwindConfig: Type.String(),
      tailwindCss: Type.String(),
      ui: Type.String(),
      utils: Type.String(),
    }),
  }),
]);

export type Config = Static<typeof configSchema>;

export const registryItemTypeSchema = Type.Union([
  Type.Literal('registry:lib'),
  Type.Literal('registry:block'),
  Type.Literal('registry:component'),
  Type.Literal('registry:ui'),
  Type.Literal('registry:hook'),
  Type.Literal('registry:page'),
  Type.Literal('registry:file'),
  Type.Literal('registry:theme'),
  Type.Literal('registry:style'),
  Type.Literal('registry:item'),
  Type.Literal('registry:base'),
  Type.Literal('registry:font'),
  Type.Literal('registry:example'),
  Type.Literal('registry:internal'),
]);

export const registryItemFileSchema = Type.Object({
  content: Type.Optional(Type.String()),
  path: Type.String(),
  target: Type.Optional(Type.String()),
  type: registryItemTypeSchema,
});

export const registryItemTailwindSchema = Type.Object({
  config: Type.Optional(
    Type.Object({
      content: Type.Optional(Type.Array(Type.String())),
      plugins: Type.Optional(Type.Array(Type.String())),
      theme: Type.Optional(Type.Record(Type.String(), Type.Any())),
    }),
  ),
});

export const registryItemCssVarsSchema = Type.Object({
  dark: Type.Optional(Type.Record(Type.String(), Type.String())),
  light: Type.Optional(Type.Record(Type.String(), Type.String())),
  theme: Type.Optional(Type.Record(Type.String(), Type.String())),
});

export const registryItemCssSchema = Type.Record(Type.String(), Type.Any());

export const registryItemEnvVarsSchema = Type.Record(Type.String(), Type.String());

export const registryItemFontSchema = Type.Object({
  family: Type.String(),
  import: Type.String(),
  provider: Type.Literal('google'),
  subsets: Type.Optional(Type.Array(Type.String())),
  variable: Type.String(),
  weight: Type.Optional(Type.Array(Type.String())),
});

export const registryItemSchema = Type.Object({
  $schema: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  categories: Type.Optional(Type.Array(Type.String())),
  config: Type.Optional(Type.Partial(rawConfigSchema)),
  css: Type.Optional(registryItemCssSchema),
  cssVars: Type.Optional(registryItemCssVarsSchema),
  dependencies: Type.Optional(Type.Array(Type.String())),
  description: Type.Optional(Type.String()),
  devDependencies: Type.Optional(Type.Array(Type.String())),
  docs: Type.Optional(Type.String()),
  envVars: Type.Optional(registryItemEnvVarsSchema),
  extends: Type.Optional(Type.String()),
  files: Type.Optional(Type.Array(registryItemFileSchema)),
  font: Type.Optional(registryItemFontSchema),
  meta: Type.Optional(Type.Record(Type.String(), Type.Any())),
  name: Type.String(),
  registryDependencies: Type.Optional(Type.Array(Type.String())),
  tailwind: Type.Optional(registryItemTailwindSchema),
  title: Type.Optional(Type.String()),
  type: registryItemTypeSchema,
});

export type RegistryItem = Static<typeof registryItemSchema>;

export const registrySchema = Type.Object({
  homepage: Type.String(),
  items: Type.Array(registryItemSchema),
  name: Type.String(),
});

export type Registry = Static<typeof registrySchema>;

// --- Monorepo Specific Schemas ---

export const registryManifestEntrySchema = Type.Object({
  installedAt: Type.String(),
  package: Type.String(),
  path: Type.String(),
  registry: Type.String(),
});

export type RegistryManifestEntry = Static<typeof registryManifestEntrySchema>;

export const manifestSchema = Type.Object({
  components: Type.Record(Type.String(), registryManifestEntrySchema),
});

export type Manifest = Static<typeof manifestSchema>;

export const workspacePackageSchema = Type.Object({
  hasConfig: Type.Boolean(),
  name: Type.String(),
  path: Type.String(),
  relativePath: Type.String(),
});

export type WorkspacePackage = Static<typeof workspacePackageSchema>;
