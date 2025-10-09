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
    lastError: Scraper.lastError,
    errorCount: Scraper.errorCount,
    successCount: Scraper.successCount,
  }),
  {
    response: {
      200: t.Object({
        lastError: t.Nullable(
          t.Date({
            description:
              "Timestamp of the last error, or null if no errors have occurred",
          }),
        ),
        errorCount: t.Record(
          t.Number({
            description: "Channel number",
          }),
          t.Number({
            description: "Number of errors for this channel",
          }),
        ),
        successCount: t.Number({
          description: "Total number of successful scrapes",
        }),
      }),
    },
  },
);
