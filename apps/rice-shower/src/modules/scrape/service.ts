import { heaterMetrics, sensorMetrics } from "@repo/tsdb";

import { heaterClient, lggClient } from "@/core/api";
import { db } from "@/core/db";
import { environment } from "@/core/environment";

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

async function scrapeHeater(instance: string, pin: number) {
  const { data, error } = await heaterClient.GET("/pid/status");

  if (error) {
    throw new Error(`Failed to fetch heater data: ${error}`);
  }

  const TEMP_MOCK_POWER = 45;

  await db.insert(heaterMetrics).values({
    time: new Date(),
    instance,
    pinNumber: pin,
    dutyCycle: data.dutyCycle,
    powerWatts: (TEMP_MOCK_POWER * data.dutyCycle) / 100,
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
    // Scrape sensor data
    for (const channel of environment.SCRAPE_CHANNELS) {
      try {
        await scrapeLGG("sensor-1", channel);
        this.sensor.successCount++;
      } catch (_) {
        this.sensor.lastError = new Date();
        this.sensor.errorCount[channel] =
          (this.sensor.errorCount[channel] ?? 0) + 1;
      }
    }

    // Scrape heater data
    for (const pin of environment.SCRAPE_PINS) {
      try {
        await scrapeHeater("heater-1", pin);
        this.heater.successCount++;
      } catch (_) {
        this.heater.lastError = new Date();
        this.heater.errorCount[pin] = (this.heater.errorCount[pin] ?? 0) + 1;
      }
    }
  }
}
