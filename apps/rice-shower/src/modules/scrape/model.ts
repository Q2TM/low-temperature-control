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

const WindowedScrapeStats = t.Object({
  successLast1M: t.Number({
    description: "Number of successful scrapes in the last 1 minute",
  }),
  successLast10M: t.Number({
    description: "Number of successful scrapes in the last 10 minutes",
  }),
  successTotal: t.Number({
    description: "Total number of successful scrapes since service start",
  }),
  errorsLast1M: t.Number({
    description: "Number of failed scrapes in the last 1 minute",
  }),
  errorsLast10M: t.Number({
    description: "Number of failed scrapes in the last 10 minutes",
  }),
  errorsTotal: t.Number({
    description: "Total number of failed scrapes since service start",
  }),
  lastError: t.Nullable(
    t.String({
      description: "Timestamp of the last error, or null if none",
      format: "date-time",
    }),
  ),
  lastErrorMessage: t.Nullable(
    t.String({
      description: "Message of the last error, or null if none",
    }),
  ),
  errorCountPerChannel: t.Record(t.String(), t.Number(), {
    description:
      "Mapping of channel number to cumulative error count for that channel",
  }),
});

export const WindowedScrapeMetricsResponse = t.Object({
  thermo: WindowedScrapeStats,
  heater: WindowedScrapeStats,
  startedAt: t.String({
    description: "UTC timestamp when this scraper was started",
    format: "date-time",
  }),
});

export const SystemWindowedScrapeMetricsResponse = t.Object({
  systemId: t.String({ description: "System identifier" }),
  ...WindowedScrapeMetricsResponse.properties,
});

export const AllSystemsWindowedScrapeMetricsResponse = t.Array(
  SystemWindowedScrapeMetricsResponse,
);

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
