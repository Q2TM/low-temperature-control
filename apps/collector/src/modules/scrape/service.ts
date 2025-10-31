import { sensorMetrics } from "@repo/tsdb";

import { client } from "@/core/api";
import { db } from "@/core/db";

async function scrapeMetrics(instance: string, channel: number) {
  const { data, error } = await client.GET(
    "/api/v1/reading/monitor/{channel}",
    {
      params: {
        path: { channel },
      },
    },
  );

  if (error) {
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
    for (let i = 1; i <= 4; i++) {
      try {
        await scrapeMetrics("sensor-1", i);
        this.successCount++;
      } catch (_) {
        this.lastError = new Date();
        this.errorCount[i] = (this.errorCount[i] ?? 0) + 1;
      }
    }
  }
}
