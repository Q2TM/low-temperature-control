import { Configuration, ReadingApi } from "@repo/api-client/lgg";
import { sensorMetrics } from "@repo/tsdb";

import { db } from "./db";
import { environment } from "./environment";

const readingApi = new ReadingApi(
  new Configuration({ basePath: environment.LGG_URL }),
);

async function scrapeMetrics(channel: number) {
  const data = await readingApi.getMonitor(channel);

  await db.insert(sensorMetrics).values({
    time: new Date(),
    instance: "sensor-1",
    channel: channel,
    tempKelvin: data.kelvin ?? null,
    resistanceOhms: data.sensor ?? null,
  });
}

setInterval(async () => {
  for (let i = 1; i <= 4; i++) {
    await scrapeMetrics(i);
  }
}, 1000);
