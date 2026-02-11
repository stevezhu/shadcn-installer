import { Type, type Static } from "typebox"

export const registryConfigItemSchema = Type.Union([
  Type.String(),
  Type.Object({
    url: Type.String(),
    params: Type.Optional(Type.Record(Type.String(), Type.String())),
    headers: Type.Optional(Type.Record(Type.String(), Type.String())),
  }),
])

export const registryConfigSchema = Type.Record(
  Type.String(), // Should start with @
  registryConfigItemSchema
)

export const rawConfigSchema = Type.Object({
  $schema: Type.Optional(Type.String()),
  style: Type.String(),
  rsc: Type.Optional(Type.Boolean({ default: false })),
  tsx: Type.Optional(Type.Boolean({ default: true })),
  tailwind: Type.Object({
    config: Type.Optional(Type.String()),
    css: Type.String(),
    baseColor: Type.String(),
    cssVariables: Type.Optional(Type.Boolean({ default: true })),
    prefix: Type.Optional(Type.String()),
  }),
  iconLibrary: Type.Optional(Type.String()),
  rtl: Type.Optional(Type.Boolean({ default: false })),
  menuColor: Type.Optional(
    Type.Union([Type.Literal("default"), Type.Literal("inverted")], {
      default: "default",
    })
  ),
  menuAccent: Type.Optional(
    Type.Union([Type.Literal("subtle"), Type.Literal("bold")], {
      default: "subtle",
    })
  ),
  aliases: Type.Object({
    components: Type.String(),
    utils: Type.String(),
    ui: Type.Optional(Type.String()),
    lib: Type.Optional(Type.String()),
    hooks: Type.Optional(Type.String()),
  }),
  registries: Type.Optional(registryConfigSchema),
})

export type RawConfig = Static<typeof rawConfigSchema>

export const configSchema = Type.Intersect([
  rawConfigSchema,
  Type.Object({
    resolvedPaths: Type.Object({
      cwd: Type.String(),
      tailwindConfig: Type.String(),
      tailwindCss: Type.String(),
      utils: Type.String(),
      components: Type.String(),
      lib: Type.String(),
      hooks: Type.String(),
      ui: Type.String(),
    }),
  }),
])

export type Config = Static<typeof configSchema>

export const registryItemTypeSchema = Type.Union([
  Type.Literal("registry:lib"),
  Type.Literal("registry:block"),
  Type.Literal("registry:component"),
  Type.Literal("registry:ui"),
  Type.Literal("registry:hook"),
  Type.Literal("registry:page"),
  Type.Literal("registry:file"),
  Type.Literal("registry:theme"),
  Type.Literal("registry:style"),
  Type.Literal("registry:item"),
  Type.Literal("registry:base"),
  Type.Literal("registry:font"),
  Type.Literal("registry:example"),
  Type.Literal("registry:internal"),
])

export const registryItemFileSchema = Type.Object({
  path: Type.String(),
  content: Type.Optional(Type.String()),
  type: registryItemTypeSchema,
  target: Type.Optional(Type.String()),
})

export const registryItemTailwindSchema = Type.Object({
  config: Type.Optional(
    Type.Object({
      content: Type.Optional(Type.Array(Type.String())),
      theme: Type.Optional(Type.Record(Type.String(), Type.Any())),
      plugins: Type.Optional(Type.Array(Type.String())),
    })
  ),
})

export const registryItemCssVarsSchema = Type.Object({
  theme: Type.Optional(Type.Record(Type.String(), Type.String())),
  light: Type.Optional(Type.Record(Type.String(), Type.String())),
  dark: Type.Optional(Type.Record(Type.String(), Type.String())),
})

export const registryItemCssSchema = Type.Record(Type.String(), Type.Any())

export const registryItemEnvVarsSchema = Type.Record(Type.String(), Type.String())

export const registryItemFontSchema = Type.Object({
  family: Type.String(),
  provider: Type.Literal("google"),
  import: Type.String(),
  variable: Type.String(),
  weight: Type.Optional(Type.Array(Type.String())),
  subsets: Type.Optional(Type.Array(Type.String())),
})

export const registryItemSchema = Type.Object({
  $schema: Type.Optional(Type.String()),
  extends: Type.Optional(Type.String()),
  name: Type.String(),
  type: registryItemTypeSchema,
  title: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  dependencies: Type.Optional(Type.Array(Type.String())),
  devDependencies: Type.Optional(Type.Array(Type.String())),
  registryDependencies: Type.Optional(Type.Array(Type.String())),
  files: Type.Optional(Type.Array(registryItemFileSchema)),
  tailwind: Type.Optional(registryItemTailwindSchema),
  cssVars: Type.Optional(registryItemCssVarsSchema),
  css: Type.Optional(registryItemCssSchema),
  envVars: Type.Optional(registryItemEnvVarsSchema),
  meta: Type.Optional(Type.Record(Type.String(), Type.Any())),
  docs: Type.Optional(Type.String()),
  categories: Type.Optional(Type.Array(Type.String())),
  config: Type.Optional(Type.Partial(rawConfigSchema)),
  font: Type.Optional(registryItemFontSchema),
})

export type RegistryItem = Static<typeof registryItemSchema>

export const registrySchema = Type.Object({
  name: Type.String(),
  homepage: Type.String(),
  items: Type.Array(registryItemSchema),
})

export type Registry = Static<typeof registrySchema>

// --- Monorepo Specific Schemas ---

export const registryManifestEntrySchema = Type.Object({
  registry: Type.String(),
  package: Type.String(),
  path: Type.String(),
  installedAt: Type.String(),
})

export type RegistryManifestEntry = Static<typeof registryManifestEntrySchema>

export const manifestSchema = Type.Object({
  components: Type.Record(Type.String(), registryManifestEntrySchema),
})

export type Manifest = Static<typeof manifestSchema>

export const workspacePackageSchema = Type.Object({
  name: Type.String(),
  path: Type.String(),
  relativePath: Type.String(),
  hasConfig: Type.Boolean(),
})

export type WorkspacePackage = Static<typeof workspacePackageSchema>
