import Elysia, { t } from "elysia";

import { Scraper } from "./service";

export const scrapeController = new Elysia({
  prefix: "/scrape",
  detail: {
    tags: ["Scrape"],
  },
}).get(
  "/metrics",
  () => ({
    lastError: Scraper.lastError?.toISOString() ?? null,
    errorCount: Object.entries(Scraper.errorCount).map(([channel, count]) => ({
      channel: Number(channel),
      count,
    })),
    successCount: Scraper.successCount,
  }),
  {
    detail: {
      operationId: "getScrapeMetrics",
      summary: "Get Scrape Metrics",
      description:
        "Retrieve metrics about the scraping process, including last error time, error counts per channel, and total successful scrapes",
    },
    response: {
      200: t.Object({
        lastError: t.Nullable(
          t.String({
            description:
              "Timestamp of the last error, or null if no errors have occurred",
            format: "date-time",
          }),
        ),
        errorCount: t.Array(
          t.Object({
            channel: t.Number({
              description: "Channel number",
            }),
            count: t.Number({
              description: "Number of errors for this channel",
            }),
          }),
        ),
        successCount: t.Number({
          description: "Total number of successful scrapes",
        }),
      }),
    },
  },
);
