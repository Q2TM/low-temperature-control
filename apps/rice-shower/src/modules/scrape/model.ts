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
  thermo: t.Object(
    {
      ...ScrapeMetricsModel.properties,
    },
    {
      description: "Scraping metrics for thermometer data",
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

export const SystemScrapeMetricsResponse = t.Object({
  systemId: t.String({ description: "System identifier" }),
  ...ScrapeMetricsResponse.properties,
});

export const AllSystemsScrapeMetricsResponse = t.Array(
  SystemScrapeMetricsResponse,
);
