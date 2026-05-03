# E2E

End-to-end test suites for the rice-shower stack.

Each suite owns its own `docker-compose.yaml` and brings up the minimum set
of services it needs. Suites are isolated from each other (and from the
local dev stack) by:

- a unique compose project name (so containers / volumes / networks don't
  collide), and
- unique host port mappings (so suites can run sequentially without
  fighting over `5432`, `8100`, etc.).

Tests are run with `bun test`. Each suite's lifecycle is managed inside
its spec file via `beforeAll` / `afterAll`.

## Layout

```
apps/e2e/
├── src/lib/                           shared utilities (no test code)
│   ├── compose.ts                     `docker compose up/down -v` wrapper
│   ├── wait.ts                        waitForHttp / waitForTcp helpers
│   ├── db.ts                          drizzle migrate + truncate helpers
│   └── clients/
│       └── riceShower.ts              typed wrappers over rice-shower HTTP API
└── suites/
    └── rice-shower-scrape/            Test 1: scraper writes thermo + heater data
        ├── docker-compose.yaml
        └── scrape.test.ts
```

## Running a suite

```bash
# from repo root
pnpm --filter e2e test:rice-shower-scrape
```

Requires Docker (Desktop / OrbStack) running on the host. The first run
will build all four app images, which can take a few minutes; subsequent
runs reuse the layer cache.

## Adding a new suite

1. Create `suites/<name>/docker-compose.yaml`. Pick a unique compose
   project name (set by the test) and unique host ports.
2. Write `suites/<name>/<something>.test.ts` that calls
   `composeUp({ file, projectName })` in `beforeAll` and
   `composeDown({ file, projectName })` in `afterAll`.
3. Add a `test:<name>` script to `package.json` if you want a one-shot
   command for it.
