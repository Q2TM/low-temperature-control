import { metrics } from "@opentelemetry/api";
import createClient from "openapi-fetch";

import type { Heater, LGG } from "@repo/api-client";
import { heaterMetrics, thermoMetrics } from "@repo/tsdb";

import { db } from "@/core/db";
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
  const { data, error } = await heaterClient.GET("/pid/{channel_id}/status", {
    params: {
      path: {
        channel_id: channel,
      },
    },
  });

  if (error) {
    throw new Error(`Failed to fetch heater data: ${error}`);
  }

  await db.insert(heaterMetrics).values({
    time: new Date(),
    systemId,
    channel,
    powerWatts: data.maxHeaterPowerWatts * data.power,
    metadata: { duty_cycle: data.power * 100 },
  });
}

export type ScrapeStats = {
  lastError: Date | null;
  errorCount: Record<number, number>;
  successCount: number;
};

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

  thermo: ScrapeStats = { lastError: null, errorCount: {}, successCount: 0 };
  heater: ScrapeStats = { lastError: null, errorCount: {}, successCount: 0 };

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

    for (const thermo of this.system.thermos) {
      try {
        await scrapeThermo(this.lggClient, this.systemId, thermo.channel);
        this.thermo.successCount++;
        scrapeSuccessCounter.add(1, {
          type: "thermo",
          system: this.systemId,
        });
      } catch (_) {
        this.thermo.lastError = new Date();
        this.thermo.errorCount[thermo.channel] =
          (this.thermo.errorCount[thermo.channel] ?? 0) + 1;
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
        scrapeSuccessCounter.add(1, {
          type: "heater",
          system: this.systemId,
        });
      } catch (_) {
        this.heater.lastError = new Date();
        this.heater.errorCount[heater.channel] =
          (this.heater.errorCount[heater.channel] ?? 0) + 1;
        scrapeErrorCounter.add(1, {
          type: "heater",
          system: this.systemId,
        });
      }
    }

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
