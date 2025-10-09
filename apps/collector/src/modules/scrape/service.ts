import { Configuration, ReadingApi } from "@repo/api-client/lgg";
import { sensorMetrics } from "@repo/tsdb";

import { db } from "@/core/db";
import { environment } from "@/core/environment";

const readingApi = new ReadingApi(
  new Configuration({ basePath: environment.LGG_URL }),
);

async function scrapeMetrics(instance: string, channel: number) {
  const data = await readingApi.getMonitor(channel);

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
