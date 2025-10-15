# shadcn-installer

Enhanced [shadcn/ui](https://github.com/shadcn-ui/ui) installer with first-class monorepo support.

The standard [shadcn CLI](https://ui.shadcn.com/docs/cli) has limitations when working with monorepo structures, making it difficult to install and manage components across multiple packages. This installer provides enhanced tooling that better handles monorepo configurations, workspace dependencies, and component installation in complex project structures.

## Features

- 🎯 **First-class monorepo support** - Designed for pnpm workspaces, Turborepo, and other monorepo setups
- 📦 **Automatic dependency resolution** - Intelligently manages workspace dependencies across packages
- 🔄 **Multi-registry support** - Install from shadcn/ui, AI Elements, MagicUI, and custom registries
- 📋 **Registry manifest tracking** - Keeps track of component locations across your workspace
- 🚀 **Clean component organization** - Separate components by registry and source

## Usage

```bash
# Use with pnpm
pnpm dlx shadcn-installer add [components...]

# Use with npm
npx shadcn-installer add [components...]

# Use with yarn
yarn dlx shadcn-installer add [components...]
```

## Quick Start

1. Navigate to your target package in your monorepo:

   ```bash
   cd packages/shadcn
   ```

2. Install shadcn/ui components:

   ```bash
   pnpm dlx shadcn-installer add button card dialog
   ```

3. Import and use in your apps:
   ```typescript
   import { Button } from '@workspace/shadcn/components/button';
   ```

## How It Works

### Monorepo Structure

This installer is designed for monorepo setups. While it was built with [pnpm workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turborepo.com/docs) in mind, it aims to support other monorepo configurations as well.

**Note:** The examples below assume `@workspace` is your internal workspace namespace for packages within the monorepo.

Here's an example structure:

```
my-project/
├── apps/
│   ├── web/
│   ├── mobile/
│   └── admin/
└── packages/
    ├── ai-elements/      # AI Elements registry components
    ├── shadcn/           # shadcn/ui registry components
    ├── magicui/          # MagicUI registry components
    └── shared/           # Shared utilities
```

### Component Installation

Each registry can be installed into its own package within your monorepo. This allows you to:

- **Organize components by source** - Keep components from different registries separated
- **Version independently** - Update registries at your own pace
- **Share across apps** - Reference components from any app in your monorepo

> [!TIP]
> **Best Practice:** Keep all components from a single registry in the same workspace package. While you can have multiple registries in a single workspace, avoid splitting components from one registry across multiple workspaces as this can complicate dependency resolution and maintenance.

#### Example: Installing Multiple Registries

```bash
# Install shadcn/ui components
cd packages/shadcn
pnpm dlx shadcn-installer add button card dialog

# Install AI Elements components
cd ../ai-elements
pnpm dlx shadcn-installer add @ai-elements/actions @ai-elements/message

# Install MagicUI components
cd ../magicui
pnpm dlx shadcn-installer add @magicui/globe
```

### Automatic Dependency Resolution

The installer tracks where each registry component is installed through a **registry manifest file**. When a component has dependencies on other registry components, the installer automatically:

1. **Checks the manifest** to see if the dependency is already installed
2. **Resolves the location** of the dependency within your monorepo
3. **Adds workspace dependencies** to your `package.json`

#### Example

If a `conversation` component from AI Elements depends on a `button` from shadcn/ui:

1. The installer checks the manifest and finds that `button` is installed in `packages/shadcn`
2. It automatically adds a workspace dependency to `packages/ai-elements/package.json`:

```json
{
  "dependencies": {
    "@workspace/shadcn": "workspace:*"
  }
}
```

This approach ensures:

- ✅ Components can depend on each other across registries
- ✅ Clean separation of concerns
- ✅ Automatic workspace dependency management
- ✅ Apps can import from any package in the monorepo

### Usage in Apps

Once installed, apps can import components from any package:

```typescript
// In apps/web/src/page.tsx
import { Message, MessageContent } from '@workspace/ai-elements/ai-elements/message'
import { Button } from '@workspace/shadcn/components/button'
import { Globe } from '@workspace/magicui/components/globe'

export default function Page() {
  return (
    <div>
      <Message from="user">
        <MessageContent>Hi there!</MessageContent>
      </Message>
      <Button>Click me</Button>
      <Globe />
    </div>
  )
}
```

## Documentation References

- [shadcn/ui Registry - Introduction](https://ui.shadcn.com/docs/registry)
- [shadcn/ui Registry - Getting Started](https://ui.shadcn.com/docs/registry/getting-started)
- [shadcn/ui Registry - Namespaces](https://ui.shadcn.com/docs/registry/namespace)

## Prerequisites

- Node.js 20+ or later
- A monorepo setup (pnpm workspaces, npm workspaces, Yarn workspaces, or Turborepo)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
