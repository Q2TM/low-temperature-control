# Low Temperature Control

This is a project related to low temperature control system.

The objective is to create a system that control temperature via PID and allow remote monitoring via web interface.

The components of this project include:

- Temperature Sensor with **Lakeshore Model 240** connected to **Lakeshore Management API (`apps/ls-api`)** that expose Lakeshore USB Serial to REST API
- **Heater Control (`apps/heater-api`)** that control Heater via GPIO with PID Logic, expose REST API for setting target temperature, pid parameters and get state of PID
- **Data Collector (`apps/rice-shower`)** that collect data from Lakeshore Management API and Heater API, store data in TimescaleDB and expose REST API endpoint for querying data
- **Web Dashboard (`apps/web`)** that provide web interface for monitoring temperature and heater status, and setting target temperature and pid parameters

For development purpose:

- **Environment Simulator (`apps/simulator`)** that simulate the environment and stub for Lakeshore Management API and Heater API

## Design System

All fundamental components are located in `packages/ui` and follow atomic design principles with shadcn as the base. The folder structure follows singular naming convention (best practice):

- **`src/icon/`** - Icon components (e.g., Spinner)
- **`src/atom/`** - Basic building blocks (e.g., Button, Input, Label, Badge, Skeleton, Textarea, Toggle)
- **`src/molecule/`** - Combinations of atoms (e.g., Card, Dialog, Form, Select, Table, ToggleGroup, DropdownMenu)
- **`src/organism/`** - Complex combinations (e.g., Chart, CurveChart, CurveDataTable, CurveHeaderForm)
- **`src/template/`** - Page-level templates (currently empty)

### Adding New shadcn Components

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
