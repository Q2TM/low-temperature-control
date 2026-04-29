import { metrics } from "@opentelemetry/api";
import createClient from "openapi-fetch";

import type { Heater, LGG } from "@repo/api-client";
import { heaterMetrics, thermoMetrics } from "@repo/tsdb";

import { db } from "@/core/db";
import { reconcileFromHeaterStatus } from "@/modules/experiments/service";
import {
  listSystems,
  type SystemWithRelations,
} from "@/modules/systems/service";

const meter = metrics.getMeter("rice-shower");
const scrapeDuration = meter.createHistogram("scrape.duration", {
  description: "Time per scrape cycle",
  unit: "ms",
});
const scrapeSuccessCounter = meter.createCounter("scrape.success.total", {
  description: "Successful scrapes",
});
const scrapeErrorCounter = meter.createCounter("scrape.errors.total", {
  description: "Failed scrapes",
});

function createLggClient(baseUrl: string) {
  return createClient<LGG.Paths>({ baseUrl });
}

function createHeaterClient(baseUrl: string) {
  return createClient<Heater.Paths>({ baseUrl });
}

async function scrapeThermo(
  lggClient: ReturnType<typeof createLggClient>,
  systemId: string,
  channel: number,
) {
  const { data, error } = await lggClient.GET(
    "/api/v1/reading/monitor/{channel}",
    {
      params: {
        path: { channel },
      },
    },
  );

  if (error || !data) {
    throw new Error(`Failed to fetch data for channel ${channel}: ${error}`);
  }

  await db.insert(thermoMetrics).values({
    time: new Date(),
    systemId,
    channel,
    tempKelvin: data.kelvin ?? null,
    metadata: { resistance_ohms: data.sensor ?? null },
  });
}

async function scrapeHeater(
  heaterClient: ReturnType<typeof createHeaterClient>,
  systemId: string,
  channel: number,
) {
  const { data, error } = await heaterClient.GET(
    "/channels/{channel_id}/status",
    {
      params: {
        path: {
          channel_id: channel,
        },
      },
    },
  );

  if (error) {
    throw new Error(`Failed to fetch heater data: ${error}`);
  }

  await db.insert(heaterMetrics).values({
    time: new Date(),
    systemId,
    channel,
    powerWatts: data.heater.powerWatts,
    powerPercent: data.heater.power * 100,
  });

  // Self-heal: if PID has stopped while an experiment is still marked running
  // for this (system, channel), finalize it with the reason from the heater.
  try {
    await reconcileFromHeaterStatus({
      systemId,
      channel,
      pidIsActive: data.pid.isActive,
      lastStopReason: data.pid.lastStopReason,
      lastStopAt: data.pid.lastStopAt,
      lastStopDetail: data.pid.lastStopDetail,
      currentPid: {
        target: data.pid.target,
        kp: data.pid.parameters.kp,
        ki: data.pid.parameters.ki,
        kd: data.pid.parameters.kd,
      },
    });
  } catch (e) {
    console.error(
      `[scrape] experiment reconcile failed for ${systemId}/${channel}:`,
      e,
    );
  }
}

export type ScrapeStats = {
  lastError: Date | null;
  lastErrorMessage: string | null;
  errorCount: Record<number, number>;
  successCount: number;
  /** Timestamps of recent successes for windowed counting */
  successTimestamps: number[];
  /** Timestamps of recent errors for windowed counting */
  errorTimestamps: number[];
};

const ONE_MINUTE_MS = 60_000;
const TEN_MINUTES_MS = 600_000;

function initScrapeStats(): ScrapeStats {
  return {
    lastError: null,
    lastErrorMessage: null,
    errorCount: {},
    successCount: 0,
    successTimestamps: [],
    errorTimestamps: [],
  };
}

/** Count entries in a sorted timestamp array that fall within the last `windowMs`. */
function countInWindow(timestamps: number[], windowMs: number): number {
  const cutoff = Date.now() - windowMs;
  // Binary search for first index >= cutoff
  let lo = 0;
  let hi = timestamps.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (timestamps[mid]! < cutoff) lo = mid + 1;
    else hi = mid;
  }
  return timestamps.length - lo;
}

/** Remove entries older than 10 minutes from a sorted timestamp array. */
function pruneTimestamps(timestamps: number[]): number[] {
  const cutoff = Date.now() - TEN_MINUTES_MS;
  let lo = 0;
  let hi = timestamps.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (timestamps[mid]! < cutoff) lo = mid + 1;
    else hi = mid;
  }
  return lo > 0 ? timestamps.slice(lo) : timestamps;
}

export function getWindowedStats(stats: ScrapeStats) {
  return {
    successLast1M: countInWindow(stats.successTimestamps, ONE_MINUTE_MS),
    successLast10M: countInWindow(stats.successTimestamps, TEN_MINUTES_MS),
    successTotal: stats.successCount,
    errorsLast1M: countInWindow(stats.errorTimestamps, ONE_MINUTE_MS),
    errorsLast10M: countInWindow(stats.errorTimestamps, TEN_MINUTES_MS),
    errorsTotal: Object.values(stats.errorCount).reduce((a, b) => a + b, 0),
    lastError: stats.lastError,
    lastErrorMessage: stats.lastErrorMessage,
    errorCountPerChannel: stats.errorCount,
  };
}

/**
 * Per-system scraper instance. Holds cached API clients and tracks
 * scrape metrics independently for one system.
 */
export class Scraper {
  readonly systemId: string;

  private lggClient: ReturnType<typeof createLggClient>;
  private heaterClient: ReturnType<typeof createHeaterClient>;
  private system: SystemWithRelations;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  thermo: ScrapeStats = initScrapeStats();
  heater: ScrapeStats = initScrapeStats();
  startedAt: Date = new Date();

  constructor(system: SystemWithRelations) {
    this.systemId = system.id;
    this.system = system;
    this.lggClient = createLggClient(system.thermoUrl);
    this.heaterClient = createHeaterClient(system.heaterUrl);
  }

  /** Update the system config and recreate clients if URLs changed. */
  updateSystem(system: SystemWithRelations) {
    if (
      system.thermoUrl !== this.system.thermoUrl ||
      system.heaterUrl !== this.system.heaterUrl
    ) {
      this.lggClient = createLggClient(system.thermoUrl);
      this.heaterClient = createHeaterClient(system.heaterUrl);
    }
    this.system = system;
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.job();
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async job() {
    const jobStart = performance.now();
    const now = Date.now();

    for (const thermo of this.system.thermos) {
      try {
        await scrapeThermo(this.lggClient, this.systemId, thermo.channel);
        this.thermo.successCount++;
        this.thermo.successTimestamps.push(now);
        scrapeSuccessCounter.add(1, {
          type: "thermo",
          system: this.systemId,
        });
      } catch (e) {
        this.thermo.lastError = new Date();
        this.thermo.lastErrorMessage =
          e instanceof Error ? e.message : String(e);
        this.thermo.errorCount[thermo.channel] =
          (this.thermo.errorCount[thermo.channel] ?? 0) + 1;
        this.thermo.errorTimestamps.push(now);
        scrapeErrorCounter.add(1, {
          type: "thermo",
          system: this.systemId,
        });
      }
    }

    for (const heater of this.system.heaters) {
      try {
        await scrapeHeater(this.heaterClient, this.systemId, heater.channel);
        this.heater.successCount++;
        this.heater.successTimestamps.push(now);
        scrapeSuccessCounter.add(1, {
          type: "heater",
          system: this.systemId,
        });
      } catch (e) {
        this.heater.lastError = new Date();
        this.heater.lastErrorMessage =
          e instanceof Error ? e.message : String(e);
        this.heater.errorCount[heater.channel] =
          (this.heater.errorCount[heater.channel] ?? 0) + 1;
        this.heater.errorTimestamps.push(now);
        scrapeErrorCounter.add(1, {
          type: "heater",
          system: this.systemId,
        });
      }
    }

    // Prune old timestamps every cycle to bound memory
    this.thermo.successTimestamps = pruneTimestamps(
      this.thermo.successTimestamps,
    );
    this.thermo.errorTimestamps = pruneTimestamps(this.thermo.errorTimestamps);
    this.heater.successTimestamps = pruneTimestamps(
      this.heater.successTimestamps,
    );
    this.heater.errorTimestamps = pruneTimestamps(this.heater.errorTimestamps);

    scrapeDuration.record(performance.now() - jobStart, {
      system: this.systemId,
    });
  }
}

/** Manages all per-system Scraper instances. */
export class ScraperManager {
  private static scrapers = new Map<string, Scraper>();

  static async initialize() {
    await this.reloadSystems();
  }

  static async reloadSystems() {
    const enabledSystems = (await listSystems()).filter((s) => s.enabled);
    const enabledIds = new Set(enabledSystems.map((s) => s.id));

    // Stop and remove scrapers for systems that are no longer enabled
    for (const [id, scraper] of this.scrapers) {
      if (!enabledIds.has(id)) {
        scraper.stop();
        this.scrapers.delete(id);
      }
    }

    // Create or update scrapers for enabled systems
    for (const system of enabledSystems) {
      const existing = this.scrapers.get(system.id);
      if (existing) {
        existing.updateSystem(system);
      } else {
        const scraper = new Scraper(system);
        scraper.start();
        this.scrapers.set(system.id, scraper);
      }
    }

    console.log(
      `Scraper loaded ${this.scrapers.size} enabled system(s): ${[...this.scrapers.keys()].join(", ")}`,
    );
  }

  static getScraper(systemId: string): Scraper | undefined {
    return this.scrapers.get(systemId);
  }

  static getAllScrapers(): Map<string, Scraper> {
    return this.scrapers;
  }
}
