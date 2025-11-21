import { t } from "elysia";

export const ScrapeMetricsModel = t.Object({
  lastError: t.Nullable(
    t.String({
      description:
        "Timestamp of the last error, or null if no errors have occurred",
      format: "date-time",
    }),
  ),
  errorCount: t.Array(
    t.Object({
      id: t.Number({
        description: "Channel number or pin number",
      }),
      count: t.Number({
        description: "Number of errors for this channel/pin",
      }),
    }),
  ),
  successCount: t.Number({
    description: "Total number of successful scrapes",
  }),
});

export const ScrapeMetricsResponse = t.Object({
  sensor: t.Object(
    {
      ...ScrapeMetricsModel.properties,
    },
    {
      description: "Scraping metrics for sensor data (LGG)",
    },
  ),
  heater: t.Object(
    {
      ...ScrapeMetricsModel.properties,
    },
    {
      description: "Scraping metrics for heater data",
    },
  ),
});
