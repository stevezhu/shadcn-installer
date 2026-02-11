# Shadcn Registry: Implementation & Architecture

This document details the architecture and implementation of the shadcn registry system, based on the official documentation and source code of the `shadcn` CLI.

## Core Concepts

The shadcn registry is a decentralized system for distributing code assets (components, hooks, utilities, etc.). It treats code as data, providing a schema-based way to define, package, and install resources.

### 1. Namespaces and Registries

Registries are identified by namespaces (e.g., `@shadcn`, `@acme`). These are configured in the `components.json` file of a project.

```json
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/r/{name}.json",
    "@acme": "https://registry.acme.com/resources/{name}.json"
  }
}
```

- **URL Template**: The registry URL must include a `{name}` placeholder which is replaced by the resource name during resolution.
- **Authentication**: Registries can be configured with custom headers and query parameters, often using environment variables for secrets.

### 2. Registry Item Schema

Each item in the registry is defined by the `registry-item.json` schema. Key fields include:

- `name`: The identifier of the item.
- `type`: The type of resource (e.g., `registry:ui`, `registry:hook`, `registry:lib`, `registry:block`).
- `files`: An array of files that make up the resource.
  - `path`: The source path in the registry project.
  - `target`: (Optional) Explicit target path for installation.
  - `content`: The raw content of the file (added during the build process).
- `dependencies`: List of npm packages required.
- `devDependencies`: List of development npm packages required.
- `registryDependencies`: List of other registry items required (can be namespaced).
- `tailwind`: Tailwind configuration to be merged (theme, plugins).
- `cssVars`: CSS variables for light/dark modes.
- `css`: Raw CSS to be added.
- `envVars`: Environment variables needed by the component.

### 3. Registry Index (`registry.json`)

A registry typically has a `registry.json` file at its root that lists all available items. This serves as a manifest for discovery (`search` and `view` commands).

### 4. Universal Items (Framework-Agnostic)

Introduced in version 2.9.0, Universal Items allow for framework-agnostic installation.

- **Requirements**:
  - Type must be `registry:item` or `registry:file`.
  - All files must have explicit `target` paths.
- **Benefit**: These items can be installed without requiring framework detection or an existing `components.json` file.

## CLI Workflows

### 1. Item Resolution

When a user runs `shadcn add @namespace/item`:

1. The CLI looks up `@namespace` in `components.json`.
2. It resolves the URL by replacing `{name}` with `item`.
3. It fetches the JSON from that URL.

### 2. Dependency Resolution (`resolveRegistryTree`)

The CLI recursively resolves all dependencies:

1. **Fetch**: Fetches the requested item and its `registryDependencies`.
2. **Topological Sort**: Sorts items so dependencies are processed before dependents.
3. **Merging**:
   - `tailwind` configs are deep-merged.
   - `cssVars` are merged (light/dark themes).
   - `dependencies` and `devDependencies` are collected.
4. **Deduplication**: Files are deduplicated based on their target installation paths.

### 3. Build Process (`registry:build`)

The `shadcn registry:build` command:

1. Reads a local `registry.json`.
2. For each item, it recursively resolves local imports (using `ts-morph`) to find all related files and npm dependencies.
3. It reads the content of each file and embeds it into the item's JSON.
4. It writes individual JSON files for each item into an output directory (e.g., `public/r`).

## Monorepo Challenges in Standard CLI

The standard shadcn CLI has several limitations in monorepos:

1. **Project Root Assumption**: It often assumes a single `components.json` at the project root.
2. **Single Destination**: It's difficult to split components from different registries (or even different items from the same registry) into separate workspace packages.
3. **Dependency Linkage**: It doesn't automatically handle `workspace:*` dependencies when components across packages depend on each other.

## Enhanced Installer Goals (`shadcn-installer`)

Based on `SPEC.md`, the enhanced installer aims to provide:

1. **First-class Monorepo Support**: Explicitly designed for pnpm/Turborepo workspaces.
2. **Registry Manifest Tracking**: A dedicated file to track where every component is installed across the entire monorepo.
3. **Automatic Workspace Resolution**:
   - When `@namespace/A` (in `packages/pkg-a`) depends on `@namespace/B`.
   - The installer checks the manifest to find `B`.
   - If `B` is in `packages/pkg-b`, it adds `@workspace/pkg-b` to `packages/pkg-a/package.json`.
4. **Clean Organization**: Encourages keeping registries in their own packages (e.g., `packages/shadcn`, `packages/magicui`).

## References

### Key Files in `shadcn-ui/ui` Repository

- **Namespace & URL Resolution**:
  - `packages/shadcn/src/registry/parser.ts`: Regex patterns for namespace parsing.
  - `packages/shadcn/src/registry/builder.ts`: Logic for constructing URLs and headers from registry config.
- **Dependency Resolution**:
  - `packages/shadcn/src/registry/resolver.ts`: Implementation of `resolveRegistryTree` and topological sorting.
  - `packages/shadcn/src/registry/fetcher.ts`: Network and local file fetching logic with caching.
- **Data Models & Validation**:
  - `packages/shadcn/src/registry/schema.ts`: Zod schemas for registry items and configs.
- **Registry Build**:
  - `packages/shadcn/src/commands/registry/build.ts`: CLI command for building a registry.
  - `packages/shadcn/src/registry/utils.ts`: Contains `recursivelyResolveFileImports` for AST-based dependency discovery.

### Official Documentation

- [Registry Introduction](https://ui.shadcn.com/docs/registry)
- [Getting Started](https://ui.shadcn.com/docs/registry/getting-started)
- [Registry JSON Schema](https://ui.shadcn.com/docs/registry/registry-json)
- [Namespaces & Configuration](https://ui.shadcn.com/docs/registry/namespace)
- [Authentication](https://ui.shadcn.com/docs/registry/authentication)
- [Examples & Universal Items](https://ui.shadcn.com/docs/registry/examples)
