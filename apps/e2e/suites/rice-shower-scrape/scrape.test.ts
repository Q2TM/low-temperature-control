import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { RiceShowerClient } from "@/lib/clients/riceShower";
import { composeDown, composeLogs, composeUp } from "@/lib/compose";
import { migrateTsdb } from "@/lib/db";
import { waitFor, waitForHttp } from "@/lib/wait";

const SUITE_DIR = path.dirname(fileURLToPath(import.meta.url));
const COMPOSE_FILE = path.join(SUITE_DIR, "docker-compose.yaml");
const PROJECT_NAME = "e2e-rice-shower-scrape";

const TSDB_URL =
  "postgresql://postgres:password@localhost:55432/lt_capstone_v2";
const RICE_SHOWER_URL = "http://localhost:18100";

const SYSTEM_ID = "e2e-default";

let composeUpCalled = false;

beforeAll(async () => {
  // Tear down any leftovers from a previous interrupted run.
  await composeDown({ file: COMPOSE_FILE, projectName: PROJECT_NAME }).catch(
    () => {},
  );

  // Phase 1: bring up tsdb only, run migrations against it. rice-shower
  // assumes the schema already exists (its scraper queries `systems`
  // immediately on boot), so migrations must finish before the rest of
  // the stack starts.
  await composeUp({
    file: COMPOSE_FILE,
    projectName: PROJECT_NAME,
    services: ["tsdb"],
    build: false,
    wait: true,
  });
  composeUpCalled = true;

  await migrateTsdb(TSDB_URL);

  // Phase 2: bring up the apps. `--build` so source changes are picked
  // up; subsequent runs reuse the layer cache.
  await composeUp({
    file: COMPOSE_FILE,
    projectName: PROJECT_NAME,
    build: true,
  });

  // rice-shower exposes /openapi/json once Elysia is listening.
  await waitForHttp(`${RICE_SHOWER_URL}/openapi/json`, (r) => r.ok, {
    label: "rice-shower /openapi/json",
    timeoutMs: 120_000,
    intervalMs: 1000,
  });
}, 300_000);

afterAll(async () => {
  if (!composeUpCalled) return;
  // On test failure surface app logs to make CI / local debugging less
  // mysterious. Best-effort.
  if ((process.exitCode ?? 0) !== 0) {
    await composeLogs({ file: COMPOSE_FILE, projectName: PROJECT_NAME }).catch(
      () => {},
    );
  }
  await composeDown({
    file: COMPOSE_FILE,
    projectName: PROJECT_NAME,
    volumes: true,
  });
}, 120_000);

describe("rice-shower scrapes ls-api and heater-api", () => {
  test("creates a system, scrapes both APIs, and returns thermo+heater metrics", async () => {
    const client = new RiceShowerClient(RICE_SHOWER_URL);

    // Service-name URLs work because rice-shower lives on the same
    // suite-private network as ls-api / heater-api.
    await client.createSystem({
      id: SYSTEM_ID,
      displayName: "E2E System",
      thermoUrl: "http://ls-api:8000",
      heaterUrl: "http://heater-api:8001",
      enabled: true,
      thermos: [{ channel: 5, label: "Main Thermometer" }],
      heaters: [{ channel: 1, label: "Primary Heater" }],
    });

    // Scraper runs once per second; wait until at least a few cycles
    // have landed for both thermo and heater.
    const status = await waitFor(
      async () => {
        const s = await client.getScrapeStatus(SYSTEM_ID);
        if (s.thermo.successTotal >= 3 && s.heater.successTotal >= 3) return s;
        return null;
      },
      {
        label: "scrape status to report >=3 successful cycles",
        timeoutMs: 30_000,
        intervalMs: 500,
      },
    );

    expect(status.thermo.errorsTotal).toBe(0);
    expect(status.heater.errorsTotal).toBe(0);

    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60_000);

    const thermo = await client.getThermoMetrics(SYSTEM_ID, {
      channels: [5],
      timeStart: fiveMinAgo,
      timeEnd: now,
      interval: 1,
    });
    expect(thermo.dataPoints).toBeGreaterThan(0);
    expect(thermo.metrics[0]?.channels[0]?.kelvin).toBeGreaterThan(0);

    const heater = await client.getHeaterMetrics(SYSTEM_ID, {
      channels: [1],
      timeStart: fiveMinAgo,
      timeEnd: now,
      interval: 1,
    });
    expect(heater.dataPoints).toBeGreaterThan(0);
  }, 60_000);
});
