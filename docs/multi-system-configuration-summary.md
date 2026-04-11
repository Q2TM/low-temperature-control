# Multi-system configuration — summary and next steps

This document records the design and implementation of supporting multiple **Systems** (each System = one thermo-api deployment + one heater-api deployment) from a **single** rice-shower instance and **single** web dashboard.

**Status:** Phase 1 implementation is **complete**. System configuration lives in TimescaleDB, rice-shower exposes a full CRUD API, the web dashboard uses path-based routing (`/[systemId]`) with an admin UI for managing systems.

## What was done

1. **Codebase review** of how configuration and traffic flow today:
   - **rice-shower** uses one global `LGG_URL` and `HEATER_URL` while varying only Timescale `instance` tags and channel/pin in `config.yaml`.
   - **web** uses env-based base URLs (`HEATER_URL`, `LAKESHORE_URL`, `RICE_SHOWER_URL`) and hardcoded UI strings (e.g. “Lab 20-05”) and default channels (`NEXT_PUBLIC_LAKESHORE_SENSOR_CHANNEL_TEMP`, heater channel `1`).
   - **heater-api** is already YAML-driven per process; **ls-api** is env-driven; **simulator** uses YAML with global uniqueness of `thermoChannel` / `heaterPin` within one process.

2. **First design draft** (superseded in part): multi-system YAML for rice-shower and a **separate** runtime `config.yaml` for web, aligned by hand.

3. **Revised phased plan** (current intent):
   - **Phase 1:** Only **rice-shower** and **web**. Rice-shower owns all system definitions and exposes a **registry API** (e.g. `GET /systems`). The web app discovers systems from rice-shower, lets the user pick one, then loads metrics and live control for **that** system—resolving `thermo_url` / `heater_url` from the registry on the **server**, without duplicating system lists in web YAML.
   - **Phase 2 (later):** Refactors for **simulator**, **heater-api**, and **thermo/ls-api** (not started).

4. **Cursor plan file** updated to match the phased approach and registry-centric web flow:
   - Path: `.cursor/plans/multi-system_yaml_config_cbc90d94.plan.md` (or under the user’s Cursor plans directory, depending on environment).

## Why this direction

- **Single source of truth:** Operators should not maintain parallel system definitions in rice-shower and web; rice-shower is already the core backend for scraping and historical queries.
- **Discovery:** The dashboard can list available systems by calling rice-shower instead of shipping a second config file.
- **Risk control:** Phase 1 limits scope to two apps; device APIs and simulator can catch up in Phase 2 without blocking the collector and UI.
- **Security posture (documented in plan):** Registry responses that include internal base URLs are meant for **server-to-server** use from Next server actions; the client should receive a **sanitized** subset for the switcher unless you add auth or split public vs internal endpoints later.

## Next steps (implementation checklist)

Execute in order when ready (see the Cursor plan for detail):

### Phase 1 — rice-shower

- Extend `config.yaml` schema with a `systems[]` block: `id`, `display_name`, `location`, `thermo_url`, `heater_url`, `metrics_instance`, `sensors[]`, `heaters[]` (channels + labels). Optionally keep legacy flat `scrape` + env URL defaults for migration.
- Refactor OpenAPI clients and the scrape loop to use **per-system** base URLs.
- Add **`GET /systems`** (and optionally **`GET /systems/:id`**) returning registry JSON; update OpenAPI specs and `@repo/api-client` if the monorepo generates the rice-shower client from OpenAPI.
- Update `config.example.yaml` and README (including trust model for URLs).

### Phase 1 — web

- Rely primarily on **`RICE_SHOWER_URL`**; remove multi-system dependence on `HEATER_URL` / `LAKESHORE_URL` for normal operation.
- Server-side fetch/cache of `GET /systems` from rice-shower.
- System switcher (e.g. query param or dynamic route); pass selected `systemId` into server actions and hooks.
- Resolve `thermo_url` / `heater_url` from cached registry inside server actions for live PID and live thermo reads/writes; use `metrics_instance` and channel lists for rice-shower query APIs.
- Remove hardcoded lab title and `NEXT_PUBLIC_*` channel defaults in favor of registry-driven defaults.

### Phase 2 — later

- Simulator multi-stack documentation and any structural changes.
- Optional metadata / YAML alignment on heater-api and ls-api.

## Related files (reference)

| Area               | Files                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| Rice-shower config | `apps/rice-shower/src/core/config.ts`, `config.example.yaml`               |
| Rice-shower scrape | `apps/rice-shower/src/modules/scrape/service.ts`, `src/core/api.ts`        |
| Rice-shower query  | `apps/rice-shower/src/modules/query/`                                      |
| Web API usage      | `apps/web/src/libs/serverApi.ts`, `src/actions/*.ts`, dashboard components |
| Detailed plan      | `.cursor/plans/multi-system_yaml_config_cbc90d94.plan.md`                  |
