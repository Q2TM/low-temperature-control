import Elysia, { t } from "elysia";

import {
  AllSystemsScrapeMetricsResponse,
  AllSystemsWindowedScrapeMetricsResponse,
  SystemScrapeMetricsResponse,
  SystemWindowedScrapeMetricsResponse,
} from "./model";
import { getWindowedStats, type Scraper, ScraperManager } from "./service";

function serializeScraperMetrics(scraper: Scraper) {
  return {
    systemId: scraper.systemId,
    thermo: {
      lastError: scraper.thermo.lastError?.toISOString() ?? null,
      errorCount: Object.entries(scraper.thermo.errorCount).map(
        ([channel, count]) => ({
          id: Number(channel),
          count,
        }),
      ),
      successCount: scraper.thermo.successCount,
    },
    heater: {
      lastError: scraper.heater.lastError?.toISOString() ?? null,
      errorCount: Object.entries(scraper.heater.errorCount).map(
        ([channel, count]) => ({
          id: Number(channel),
          count,
        }),
      ),
      successCount: scraper.heater.successCount,
    },
  };
}

function serializeWindowedMetrics(scraper: Scraper) {
  const thermo = getWindowedStats(scraper.thermo);
  const heater = getWindowedStats(scraper.heater);
  return {
    systemId: scraper.systemId,
    startedAt: scraper.startedAt.toISOString(),
    thermo: {
      ...thermo,
      lastError: thermo.lastError?.toISOString() ?? null,
    },
    heater: {
      ...heater,
      lastError: heater.lastError?.toISOString() ?? null,
    },
  };
}

export const scrapeController = new Elysia({
  prefix: "/scrape",
  detail: {
    tags: ["Scrape"],
  },
})
  .get(
    "/metrics",
    () => {
      return [...ScraperManager.getAllScrapers().values()].map(
        serializeScraperMetrics,
      );
    },
    {
      detail: {
        operationId: "getAllScrapeMetrics",
        summary: "Get All Scrape Metrics",
        description:
          "Retrieve scraping metrics for all active systems, including per-system error counts and success totals",
      },
      response: {
        200: AllSystemsScrapeMetricsResponse,
      },
    },
  )
  .get(
    "/metrics/:systemId",
    ({ params: { systemId }, status }) => {
      const scraper = ScraperManager.getScraper(systemId);
      if (!scraper) {
        throw status(404, {
          error: `No active scraper for system '${systemId}'`,
        });
      }
      return serializeScraperMetrics(scraper);
    },
    {
      detail: {
        operationId: "getSystemScrapeMetrics",
        summary: "Get System Scrape Metrics",
        description:
          "Retrieve scraping metrics for a specific system by its ID",
      },
      response: {
        200: SystemScrapeMetricsResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .get(
    "/status",
    () => {
      return [...ScraperManager.getAllScrapers().values()].map(
        serializeWindowedMetrics,
      );
    },
    {
      detail: {
        operationId: "getAllScrapeStatus",
        summary: "Get All Scrape Status",
        description:
          "Retrieve windowed scrape status (success/error counts in last 1m, 10m, and since start) for all active systems",
      },
      response: {
        200: AllSystemsWindowedScrapeMetricsResponse,
      },
    },
  )
  .get(
    "/status/:systemId",
    ({ params: { systemId }, status }) => {
      const scraper = ScraperManager.getScraper(systemId);
      if (!scraper) {
        throw status(404, {
          error: `No active scraper for system '${systemId}'`,
        });
      }
      return serializeWindowedMetrics(scraper);
    },
    {
      detail: {
        operationId: "getSystemScrapeStatus",
        summary: "Get System Scrape Status",
        description:
          "Retrieve windowed scrape status for a specific system by its ID",
      },
      response: {
        200: SystemWindowedScrapeMetricsResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  );
