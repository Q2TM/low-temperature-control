# @repo/ui

UI Library

## Component Structure

This package follows atomic design principles with singular naming convention:

- **`src/icon/`** - Icon components (e.g., Spinner)
- **`src/atom/`** - Basic building blocks (e.g., Button, Input, Label, Badge, Skeleton, Textarea, Toggle)
- **`src/molecule/`** - Combinations of atoms (e.g., Card, Dialog, Form, Select, Table, ToggleGroup, DropdownMenu)
- **`src/organism/`** - Complex combinations (e.g., Chart, CurveChart, CurveDataTable, CurveHeaderForm)
- **`src/template/`** - Page-level templates (currently empty)

## Documentation

- **[Chart Components Documentation](./src/organism/CHART_DOCS.md)** - Comprehensive guide for chart components, including:
  - Line interpolation types (monotone vs natural vs linear)
  - Y-axis domain configuration
  - Common patterns and best practices
  - Troubleshooting chart issues

## Adding New shadcn Components

When using `pnpm dlx shadcn` inside `packages/ui` to add new components:

1. **Initial Generation**: Components will be generated at `src/components/ui/`
2. **Move to Appropriate Folder**: Categorize and move the component to one of:
   - `src/icon/` for icon wrappers
   - `src/atom/` for basic building blocks
   - `src/molecule/` for component combinations
   - `src/organism/` for complex features
3. **Fix Imports**:
   - Change all imports from `@repo/ui/lib/utils` to `@repo/ui/utils`
   - Use `@repo/ui/atom/*`, `@repo/ui/molecule/*`, `@repo/ui/organism/*`, or `@repo/ui/icon/*` for cross-type imports
   - Use relative imports (`./`) for same-folder imports
4. **Update Exports**: If needed, the component should already be exported via the wildcard patterns in package.json

**Important**: After adding shadcn components, always update the import path for utils from `$lib/utils` or similar to `@repo/ui/utils` to ensure it works correctly in this monorepo.
