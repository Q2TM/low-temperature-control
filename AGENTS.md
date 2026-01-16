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

All fundemental components are located in `packages/ui` and will be based on shadcn. Every new component should be prefered shadcn first and will be located at `src/components/ui` which command line should add new component to this file.

Use `pnpm dlx shadcn` inside `packages/ui` for invoking shadcn cli.

Custom or derived components shall be located in `src/components/{atom,molecule,organism}` based on atomic design system.

**Important**: After using shadcn cli to generate components, change all occurence of `$lib/utils` import or similar to correct one `@repo/ui/lib/utils` to ensure it work in this monorepo.
