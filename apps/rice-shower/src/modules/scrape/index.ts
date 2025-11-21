import Elysia from "elysia";

import { ScrapeMetricsResponse } from "./model";
import { Scraper } from "./service";

export const scrapeController = new Elysia({
  prefix: "/scrape",
  detail: {
    tags: ["Scrape"],
  },
}).get(
  "/metrics",
  () => ({
    sensor: {
      lastError: Scraper.sensor.lastError?.toISOString() ?? null,
      errorCount: Object.entries(Scraper.sensor.errorCount).map(
        ([channel, count]) => ({
          id: Number(channel),
          count,
        }),
      ),
      successCount: Scraper.sensor.successCount,
    },
    heater: {
      lastError: Scraper.heater.lastError?.toISOString() ?? null,
      errorCount: Object.entries(Scraper.heater.errorCount).map(
        ([pin, count]) => ({
          id: Number(pin),
          count,
        }),
      ),
      successCount: Scraper.heater.successCount,
    },
  }),
  {
    detail: {
      operationId: "getScrapeMetrics",
      summary: "Get Scrape Metrics",
      description:
        "Retrieve metrics about the scraping process for both sensor and heater data, including last error time, error counts, and total successful scrapes",
    },
    response: {
      200: ScrapeMetricsResponse,
    },
  },
);
