import { heaterMetrics, sensorMetrics } from "@repo/tsdb";

import { heaterClient, lggClient } from "@/core/api";
import { db } from "@/core/db";

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
    powerWatts: TEMP_MOCK_POWER * data.dutyCycle,
  });
}

export class Scraper {
  static initialize() {
    setInterval(() => {
      this.job();
    }, 1000);
  }

  static lastError: Date | null = null;
  static errorCount: Record<number, number> = {};
  static successCount = 0;

  private static async job() {
    for (let i = 1; i <= 1; i++) {
      try {
        await scrapeLGG("sensor-1", i);
        this.successCount++;
      } catch (_) {
        this.lastError = new Date();
        this.errorCount[i] = (this.errorCount[i] ?? 0) + 1;
      }
    }

    try {
      await scrapeHeater("heater-1", 18);
    } catch (_) {
      this.lastError = new Date();
    }
  }
}
