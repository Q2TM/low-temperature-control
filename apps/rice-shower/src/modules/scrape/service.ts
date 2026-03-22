import { metrics } from "@opentelemetry/api";

import { heaterMetrics, sensorMetrics } from "@repo/tsdb";

import { heaterClient, lggClient } from "@/core/api";
import { config } from "@/core/config";
import { db } from "@/core/db";

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

async function scrapeLGG(instance: string, channel: number) {
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

  await db.insert(sensorMetrics).values({
    time: new Date(),
    instance: instance,
    channel: channel,
    tempKelvin: data.kelvin ?? null,
    resistanceOhms: data.sensor ?? null,
  });
}

async function scrapeHeater(instance: string, pin: number, maxPower: number) {
  const { data, error } = await heaterClient.GET("/pid/{channel_id}/status", {
    params: {
      path: {
        channel_id: pin,
      },
    },
  });

  if (error) {
    throw new Error(`Failed to fetch heater data: ${error}`);
  }

  await db.insert(heaterMetrics).values({
    time: new Date(),
    instance,
    pinNumber: pin,
    dutyCycle: data.power * 100,
    powerWatts: maxPower * data.power,
  });
}

type ScrapeMetrics = {
  lastError: Date | null;
  errorCount: Record<number, number>;
  successCount: number;
};

export class Scraper {
  static initialize() {
    setInterval(() => {
      this.job();
    }, 1000);
  }

  // Sensor (LGG) metrics
  static sensor: ScrapeMetrics = {
    lastError: null,
    errorCount: {},
    successCount: 0,
  };

  // Heater metrics
  static heater: ScrapeMetrics = {
    lastError: null,
    errorCount: {},
    successCount: 0,
  };

  private static async job() {
    const jobStart = performance.now();

    for (const sensor of config.scrape.sensors) {
      try {
        await scrapeLGG(sensor.instance, sensor.channel);
        this.sensor.successCount++;
        scrapeSuccessCounter.add(1, { type: "sensor" });
      } catch (_) {
        this.sensor.lastError = new Date();
        this.sensor.errorCount[sensor.channel] =
          (this.sensor.errorCount[sensor.channel] ?? 0) + 1;
        scrapeErrorCounter.add(1, { type: "sensor" });
      }
    }

    for (const heater of config.scrape.heaters) {
      try {
        await scrapeHeater(heater.instance, heater.pin, heater.maxPower);
        this.heater.successCount++;
        scrapeSuccessCounter.add(1, { type: "heater" });
      } catch (_) {
        this.heater.lastError = new Date();
        this.heater.errorCount[heater.pin] =
          (this.heater.errorCount[heater.pin] ?? 0) + 1;
        scrapeErrorCounter.add(1, { type: "heater" });
      }
    }

    scrapeDuration.record(performance.now() - jobStart);
  }
}
